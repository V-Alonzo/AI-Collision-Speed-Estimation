<?php

/** @var \Laravel\Lumen\Routing\Router $router */

// ── Preflight OPTIONS (CORS) ──────────────────────────────────────────────────
$router->options('/{any:.*}', function () { return response('', 200); });

// ── Health check ──────────────────────────────────────────────────────────────
$router->get('/web',  function () { return response()->json(['response' => 'TempletDynamiCESVI']); });
$router->get('/test', function () { return '¡La API está viva!'; });
$router->get('/hola', function () { return 'Lumen está funcionando'; });

// ── Auth (sin middleware) ─────────────────────────────────────────────────────
$router->post('/login',                'LoginController@login');
$router->post('/v1/rat/auth/login',    'LoginController@login');

// ── Rutas Legacy (mantener compatibilidad) ─────────────────────────────────────
$router->group(['middleware' => 'jwt'], function () use ($router) {
    $router->get('/me',               'LoginController@me');
    $router->get('/v1/rat/auth/me',   'LoginController@me');
    $router->post('/v1/rat/auth/logout', function () {
        return response()->json(['message' => 'Sesión cerrada.']);
    });
});

$router->group(['prefix' => 'Encritacion', 'middleware' => 'jwt'], function () use ($router) {
    $router->get('{id}',          'Encript@index');
    $router->post('parametros',   'Encript@parametros');
});

$router->group(['prefix' => 'VisorConsultas', 'middleware' => 'jwt'], function () use ($router) {
    $router->get('ConsultaMonitorTotUser',    'MonitorController@show');
    $router->get('showDataFormFiltros',       'MonitorController@showDataFormFiltros');
    $router->put('apiConsultaDataVisor',      'MonitorController@showConsultaDataVisor');
    $router->put('apiOnVerDetalle',           'MonitorController@showapiOnVerDetalle');
});

$router->group(['prefix' => 'CatalogosGrales', 'middleware' => 'jwt'], function () use ($router) {
    $router->get('getDataCatalogoGral/{tipoCatalogo}',           'CatalogosGrales\CatalogosGrales@getDataCatalogoGral');
    $router->put('putCRUDCatalogo/{tipoCatalogo}/{accion}',      'CatalogosGrales\CatalogosGrales@putCRUDCatalogo');
});

$router->group(['prefix' => 'ReportePerito', 'middleware' => 'jwt'], function () use ($router) {
    $router->get('{id}', 'ReportePeritoController@show');
});

// ── RAT API — Rutas públicas (sin auth) ──────────────────────────────────────
$router->get('/v1/rat/fotos/{id}', 'RAT\ExpedienteWizardController@servirFoto');

// ── RAT API — Rutas protegidas ────────────────────────────────────────────────
$router->group(['prefix' => 'v1/rat', 'middleware' => 'jwt'], function () use ($router) {

    // Dashboard
    $router->get('/dashboard', 'RAT\DashboardController@index');

    // Incidentes
    $router->get('/incidentes',                     'RAT\IncidenteController@index');
    $router->get('/incidentes/{uuid}',              'RAT\IncidenteController@show');
    $router->delete('/incidentes/{uuid}',           'RAT\IncidenteController@destroy');
    $router->patch('/incidentes/{uuid}/estado',     'RAT\IncidenteController@cambiarEstado');

    // Evidencias por incidente (antes del uuid genérico de evidencias)
    $router->get('/incidentes/{uuid}/evidencias',   'RAT\EvidenciaController@listaBySiniestro');

    // Wizard pasos
    $router->post('/wizard/paso1-incidente',                    'RAT\ExpedienteWizardController@storePaso1');
    $router->put('/wizard/{uuid}/paso1-incidente',              'RAT\ExpedienteWizardController@updatePaso1');
    $router->put('/wizard/{uuid}/paso2-vehiculo',               'RAT\ExpedienteWizardController@updatePaso2');
    $router->put('/wizard/{uuid}/paso3-ocupantes',              'RAT\ExpedienteWizardController@updatePaso3');
    $router->put('/wizard/{uuid}/paso4-via',                    'RAT\ExpedienteWizardController@updatePaso4');
    $router->post('/wizard/{uuid}/paso5-evidencia',             'RAT\ExpedienteWizardController@storePaso5');
    $router->delete('/wizard/{uuid}/paso5-evidencia/{fotoId}',  'RAT\ExpedienteWizardController@destroyFoto');
    $router->put('/wizard/{uuid}/paso6-deformacion',            'RAT\ExpedienteWizardController@updatePaso6');
    $router->post('/wizard/{uuid}/paso7-calculo',               'RAT\ExpedienteWizardController@storePaso7');
    $router->put('/wizard/{uuid}/paso8-narrativa',              'RAT\ExpedienteWizardController@updatePaso8');
    $router->put('/wizard/{uuid}/paso9-reporte',                'RAT\ExpedienteWizardController@updatePaso9');

    // Evidencias CRUD
    $router->post('/evidencias',            'RAT\EvidenciaController@store');
    $router->get('/evidencias/{id}',        'RAT\EvidenciaController@show');
    $router->put('/evidencias/{id}',        'RAT\EvidenciaController@update');
    $router->delete('/evidencias/{id}',     'RAT\EvidenciaController@destroy');

    // Catálogos (rutas específicas antes de las paramétricas)
    $router->get('/catalogos/peritos',         'RAT\CatalogoController@peritos');
    $router->get('/catalogos/rigidez',         'RAT\CatalogoController@rigidez');
    $router->get('/catalogos/mu',              'RAT\CatalogoController@mu');
    $router->get('/catalogos',                 'RAT\CatalogoController@index');
    $router->post('/catalogos/{cat}',          'RAT\CatalogoController@store');
    $router->put('/catalogos/{cat}/{id}',      'RAT\CatalogoController@update');
    $router->delete('/catalogos/{cat}/{id}',   'RAT\CatalogoController@destroy');

    // Perfil (ruta específica antes de la genérica)
    $router->get('/perfil/expedientes',          'RAT\PerfilController@misExpedientes');
    $router->get('/perfil',                      'RAT\PerfilController@show');
    $router->put('/perfil',                      'RAT\PerfilController@update');
    $router->put('/perfil/cambiar-password',     'RAT\PerfilController@cambiarPassword');

    // Reportes
    $router->get('/reportes/{uuid}',             'RAT\ReporteController@show');
    $router->post('/reportes/{uuid}/generar',    'RAT\ReporteController@generar');
    $router->get('/reportes/{uuid}/descargar',   'RAT\ReporteController@descargar');

    // Monitor
    $router->get('/monitor', 'RAT\MonitorController@show');

    // IA velocidad
    $router->post('/ia/estimacion-velocidad/upload-url', 'RAT\AiVelocityController@createUploadUrl');
    $router->post('/ia/estimacion-velocidad/upload', 'RAT\AiVelocityController@uploadViaBackend');

    // Admin (solo admin@cesvi.com)
    $router->get('/admin/usuarios',                 'RAT\AdminController@getUsuarios');
    $router->put('/admin/usuarios/{id}/password',   'RAT\AdminController@updatePassword');
});
