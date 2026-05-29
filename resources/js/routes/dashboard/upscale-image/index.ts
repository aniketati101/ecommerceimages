import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\UpscaleImageController::index
* @see app/Http/Controllers/UpscaleImageController.php:33
* @route '/dashboard/upscale-image'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard/upscale-image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UpscaleImageController::index
* @see app/Http/Controllers/UpscaleImageController.php:33
* @route '/dashboard/upscale-image'
*/
index.url = (options?: RouteQueryOptions) => {




    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpscaleImageController::index
* @see app/Http/Controllers/UpscaleImageController.php:33
* @route '/dashboard/upscale-image'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::index
* @see app/Http/Controllers/UpscaleImageController.php:33
* @route '/dashboard/upscale-image'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::index
* @see app/Http/Controllers/UpscaleImageController.php:33
* @route '/dashboard/upscale-image'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::index
* @see app/Http/Controllers/UpscaleImageController.php:33
* @route '/dashboard/upscale-image'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::index
* @see app/Http/Controllers/UpscaleImageController.php:33
* @route '/dashboard/upscale-image'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm



const upscaleImage = {
    index,
}

export default upscaleImage