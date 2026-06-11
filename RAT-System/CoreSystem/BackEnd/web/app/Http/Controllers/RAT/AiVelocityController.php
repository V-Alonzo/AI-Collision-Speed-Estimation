<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use Aws\Credentials\Credentials;
use Aws\S3\S3Client;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiVelocityController extends Controller
{
    private function makeS3Client(): S3Client
    {
        return new S3Client([
            'version'     => 'latest',
            'region'      => $this->s3Region(),
            'credentials' => new Credentials(
                $this->s3KeyId(),
                $this->s3Secret(),
                $this->s3SessionToken() ?: null
            ),
        ]);
    }

    private function s3Region(): ?string
    {
        return env('AWS_REGION');
    }

    private function s3Bucket(): ?string
    {
        return env('AWS_BUCKET_NAME') ?: env('AWS_S3_BUCKET');
    }

    private function s3KeyId(): ?string
    {
        return env('AWS_ACCESS_KEY_ID');
    }

    private function s3Secret(): ?string
    {
        return env('AWS_SECRET_ACCESS_KEY');
    }

    private function s3SessionToken(): ?string
    {
        return env('AWS_SESSION_TOKEN');
    }

    private function s3Acl(): ?string
    {
        return env('AWS_OBJECT_ACL') ?: env('AWS_S3_OBJECT_ACL');
    }

    private function presignedExpirationSeconds(): int
    {
        return (int) env('AWS_PRESIGNED_UPLOAD_EXPIRES', 900);
    }

    private function s3Prefix(): string
    {
        return trim(env('AWS_S3_PREFIX', 'Images'), '/');
    }

    private function assertS3ConfigReady(): ?JsonResponse
    {
        if (!$this->s3Region() || !$this->s3Bucket() || !$this->s3KeyId() || !$this->s3Secret()) {
            return response()->json([
                'message' => 'La configuración de AWS S3 está incompleta en el backend.',
            ], 500);
        }

        return null;
    }

    private function makeObjectKey(string $fileName): string
    {
        $safeFileName = preg_replace('/[^A-Za-z0-9._-]/', '-', $fileName) ?: 'image';

        return sprintf(
            '%s/%s/%s-%s',
            $this->s3Prefix(),
            Carbon::now()->format('Y/m/d'),
            Str::uuid()->toString(),
            $safeFileName
        );
    }

    private function makeReadUrl(S3Client $client, string $objectKey): string
    {
        $getCommand = $client->getCommand('GetObject', [
            'Bucket' => $this->s3Bucket(),
            'Key'    => $objectKey,
        ]);

        return (string) $client
            ->createPresignedRequest($getCommand, '+' . $this->presignedExpirationSeconds() . ' seconds')
            ->getUri();
    }

    /**
     * POST /v1/rat/ia/estimacion-velocidad/upload-url
     */
    public function createUploadUrl(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file_name'    => 'required|string|max:255',
            'content_type' => 'required|string|max:150',
        ]);

        if ($configError = $this->assertS3ConfigReady()) {
            return $configError;
        }

        $client = $this->makeS3Client();
        $objectKey = $this->makeObjectKey($data['file_name']);

        $uploadParams = [
            'Bucket'      => $this->s3Bucket(),
            'Key'         => $objectKey,
            'ContentType' => $data['content_type'],
        ];

        $uploadHeaders = [
            'Content-Type' => $data['content_type'],
        ];

        if ($this->s3Acl()) {
            $uploadParams['ACL'] = $this->s3Acl();
            $uploadHeaders['x-amz-acl'] = $this->s3Acl();
        }

        $putCommand = $client->getCommand('PutObject', $uploadParams);
        $expires = $this->presignedExpirationSeconds();
        $uploadUrl = (string) $client->createPresignedRequest($putCommand, "+{$expires} seconds")->getUri();
        $imageUrl = $this->makeReadUrl($client, $objectKey);

        return response()->json([
            'upload_url'    => $uploadUrl,
            'image_url'     => $imageUrl,
            'object_key'    => $objectKey,
            'upload_method' => 'PUT',
            'headers'       => $uploadHeaders,
            'expires_in'    => $expires,
        ]);
    }

    /**
     * POST /v1/rat/ia/estimacion-velocidad/upload
     */
    public function uploadViaBackend(Request $request): JsonResponse
    {
        if ($configError = $this->assertS3ConfigReady()) {
            return $configError;
        }

        $this->validate($request, [
            'image' => 'required|file|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $file = $request->file('image');

        if (!$file || !$file->isValid()) {
            return response()->json([
                'message' => 'No se recibió una imagen válida para subir.',
            ], 422);
        }

        $client = $this->makeS3Client();
        $objectKey = $this->makeObjectKey($file->getClientOriginalName());

        $putParams = [
            'Bucket'      => $this->s3Bucket(),
            'Key'         => $objectKey,
            'Body'        => fopen($file->getRealPath(), 'rb'),
            'ContentType' => $file->getMimeType() ?: 'application/octet-stream',
        ];

        if ($this->s3Acl()) {
            $putParams['ACL'] = $this->s3Acl();
        }

        $client->putObject($putParams);

        return response()->json([
            'image_url'  => $this->makeReadUrl($client, $objectKey),
            'object_key' => $objectKey,
        ]);
    }
}