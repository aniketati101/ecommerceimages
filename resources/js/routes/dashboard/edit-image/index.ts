import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard/edit-image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
index.url = (options?: RouteQueryOptions) => {




    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
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

/**
* @see \App\Http\Controllers\ImageEditController::store
* @see app/Http/Controllers/ImageEditController.php:44
* @route '/dashboard/edit-image'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/dashboard/edit-image',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ImageEditController::store
* @see app/Http/Controllers/ImageEditController.php:44
* @route '/dashboard/edit-image'
*/
store.url = (options?: RouteQueryOptions) => {




    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageEditController::store
* @see app/Http/Controllers/ImageEditController.php:44
* @route '/dashboard/edit-image'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ImageEditController::store
* @see app/Http/Controllers/ImageEditController.php:44
* @route '/dashboard/edit-image'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ImageEditController::store
* @see app/Http/Controllers/ImageEditController.php:44
* @route '/dashboard/edit-image'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm



const editImage = {
    index,
    store,
}

export default editImage