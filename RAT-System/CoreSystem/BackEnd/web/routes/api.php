<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RAT\AuthController;
use App\Http\Controllers\RAT\CatalogoController;
use App\Http\Controllers\RAT\DashboardController;
use App\Http\Controllers\RAT\IncidenteController;
use App\Http\Controllers\RAT\ExpedienteWizardController;
use App\Http\Controllers\RAT\EvidenciaController;
use App\Http\Controllers\RAT\ReporteController;
use App\Http\Controllers\RAT\PerfilController;
use App\Http\Controllers\RAT\MonitorController;
use App\Http\Controllers\RAT\AdminController;

// ── Auth (sin middleware) ─────────────────────────────────────────────────────
Route::prefix('v1/rat/auth')->group(function () {
    Route::post('/login',  [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('/me',      [AuthController::class, 'me'])->middleware('auth:api');
});

// ── Recursos públicos (sin token) ─────────────────────────────────────────────
Route::get('/v1/rat/reportes/{uuid}/descargar', [ReporteController::class, 'descargar']);
Route::get('/v1/rat/fotos/{id}',                [ExpedienteWizardController::class, 'servirFoto']);

// ── Rutas protegidas RAT ──────────────────────────────────────────────────────
Route::prefix('v1/rat')->middleware('auth:api')->group(function () {

    // ── Dashboard ─────────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Incidentes (lista / detalle / estado) ─────────────────────────────────
    Route::get('/incidentes',               [IncidenteController::class, 'index']);
    Route::get('/incidentes/{uuid}',        [IncidenteController::class, 'show']);
    Route::delete('/incidentes/{uuid}',     [IncidenteController::class, 'destroy']);
    Route::patch('/incidentes/{uuid}/estado', [IncidenteController::class, 'cambiarEstado']);

    // ── Wizard (pasos 1–9) ────────────────────────────────────────────────────
    Route::post('/wizard/paso1-incidente',              [ExpedienteWizardController::class, 'storePaso1']);
    Route::put('/wizard/{uuid}/paso1-incidente',        [ExpedienteWizardController::class, 'updatePaso1']);
    Route::put('/wizard/{uuid}/paso2-vehiculo',         [ExpedienteWizardController::class, 'updatePaso2']);
    Route::put('/wizard/{uuid}/paso3-ocupantes',        [ExpedienteWizardController::class, 'updatePaso3']);
    Route::put('/wizard/{uuid}/paso4-via',              [ExpedienteWizardController::class, 'updatePaso4']);
    Route::post('/wizard/{uuid}/paso5-evidencia',       [ExpedienteWizardController::class, 'storePaso5']);
    Route::delete('/wizard/{uuid}/paso5-evidencia/{id}', [ExpedienteWizardController::class, 'destroyFoto']);
    Route::put('/wizard/{uuid}/paso6-deformacion',      [ExpedienteWizardController::class, 'updatePaso6']);
    Route::post('/wizard/{uuid}/paso7-calculo',         [ExpedienteWizardController::class, 'storePaso7']);
    Route::put('/wizard/{uuid}/paso8-narrativa',        [ExpedienteWizardController::class, 'updatePaso8']);
    Route::put('/wizard/{uuid}/paso9-reporte',          [ExpedienteWizardController::class, 'updatePaso9']);

    // ── Evidencias ────────────────────────────────────────────────────────────
    Route::get('/incidentes/{uuid}/evidencias', [EvidenciaController::class, 'listaBySiniestro']);
    Route::post('/evidencias',                  [EvidenciaController::class, 'store']);
    Route::get('/evidencias/{id}',              [EvidenciaController::class, 'show']);
    Route::put('/evidencias/{id}',              [EvidenciaController::class, 'update']);
    Route::delete('/evidencias/{id}',           [EvidenciaController::class, 'destroy']);

    // ── Catálogos ─────────────────────────────────────────────────────────────
    Route::get('/catalogos',                    [CatalogoController::class, 'index']);
    Route::get('/catalogos/peritos',            [CatalogoController::class, 'peritos']);
    Route::get('/catalogos/rigidez',            [CatalogoController::class, 'rigidez']);
    Route::get('/catalogos/mu',                 [CatalogoController::class, 'mu']);
    // entorno CRUD — pendiente implementar en CatalogoController
    // Route::get('/catalogos/entorno',         [CatalogoController::class, 'entorno']);
    // Route::post('/catalogos/entorno',        [CatalogoController::class, 'store']);
    // Route::get('/catalogos/entorno/{id}',    [CatalogoController::class, 'show']);
    // Route::put('/catalogos/entorno/{id}',    [CatalogoController::class, 'update']);
    // Route::delete('/catalogos/entorno/{id}', [CatalogoController::class, 'destroy']);

    // ── Reportes ──────────────────────────────────────────────────────────────
    Route::get('/reportes/{uuid}',             [ReporteController::class, 'show']);
    Route::post('/reportes/{uuid}/generar',    [ReporteController::class, 'generar']);

    // ── Perfil del perito ─────────────────────────────────────────────────────
    Route::get('/perfil',                  [PerfilController::class, 'show']);
    Route::put('/perfil',                  [PerfilController::class, 'update']);
    Route::get('/perfil/expedientes',      [PerfilController::class, 'misExpedientes']);
    Route::put('/perfil/cambiar-password', [PerfilController::class, 'cambiarPassword']);

    // ── Monitor ───────────────────────────────────────────────────────────────
    Route::get('/monitor',   [MonitorController::class, 'show']);

    // ── Admin ─────────────────────────────────────────────────────────────────
    Route::get('/admin/usuarios',                [AdminController::class, 'getUsuarios']);
    Route::put('/admin/usuarios/{id}/password',  [AdminController::class, 'updatePassword']);

});
