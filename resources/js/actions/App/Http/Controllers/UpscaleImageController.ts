import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\UpscaleImageController::history
* @see app/Http/Controllers/UpscaleImageController.php:200
* @route '/api/upscale'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/upscale',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UpscaleImageController::history
* @see app/Http/Controllers/UpscaleImageController.php:200
* @route '/api/upscale'
*/
history.url = (options?: RouteQueryOptions) => {




    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpscaleImageController::history
* @see app/Http/Controllers/UpscaleImageController.php:200
* @route '/api/upscale'
*/
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::history
* @see app/Http/Controllers/UpscaleImageController.php:200
* @route '/api/upscale'
*/
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::history
* @see app/Http/Controllers/UpscaleImageController.php:200
* @route '/api/upscale'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::history
* @see app/Http/Controllers/UpscaleImageController.php:200
* @route '/api/upscale'
*/
historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::history
* @see app/Http/Controllers/UpscaleImageController.php:200
* @route '/api/upscale'
*/
historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

history.form = historyForm

/**
* @see \App\Http\Controllers\UpscaleImageController::store
* @see app/Http/Controllers/UpscaleImageController.php:57
* @route '/api/upscale'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/upscale',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UpscaleImageController::store
* @see app/Http/Controllers/UpscaleImageController.php:57
* @route '/api/upscale'
*/
store.url = (options?: RouteQueryOptions) => {




    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpscaleImageController::store
* @see app/Http/Controllers/UpscaleImageController.php:57
* @route '/api/upscale'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::store
* @see app/Http/Controllers/UpscaleImageController.php:57
* @route '/api/upscale'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::store
* @see app/Http/Controllers/UpscaleImageController.php:57
* @route '/api/upscale'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\UpscaleImageController::show
* @see app/Http/Controllers/UpscaleImageController.php:160
* @route '/api/upscale/{job}'
*/
export const show = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/upscale/{job}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UpscaleImageController::show
* @see app/Http/Controllers/UpscaleImageController.php:160
* @route '/api/upscale/{job}'
*/
show.url = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { job: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { job: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            job: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        job: typeof args.job === 'object'
        ? args.job.id
        : args.job,
    }

    return show.definition.url
            .replace('{job}', parsedArgs.job.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpscaleImageController::show
* @see app/Http/Controllers/UpscaleImageController.php:160
* @route '/api/upscale/{job}'
*/
show.get = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::show
* @see app/Http/Controllers/UpscaleImageController.php:160
* @route '/api/upscale/{job}'
*/
show.head = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::show
* @see app/Http/Controllers/UpscaleImageController.php:160
* @route '/api/upscale/{job}'
*/
const showForm = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::show
* @see app/Http/Controllers/UpscaleImageController.php:160
* @route '/api/upscale/{job}'
*/
showForm.get = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::show
* @see app/Http/Controllers/UpscaleImageController.php:160
* @route '/api/upscale/{job}'
*/
showForm.head = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\UpscaleImageController::destroy
* @see app/Http/Controllers/UpscaleImageController.php:222
* @route '/api/upscale/{job}'
*/
export const destroy = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/upscale/{job}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\UpscaleImageController::destroy
* @see app/Http/Controllers/UpscaleImageController.php:222
* @route '/api/upscale/{job}'
*/
destroy.url = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { job: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { job: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            job: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        job: typeof args.job === 'object'
        ? args.job.id
        : args.job,
    }

    return destroy.definition.url
            .replace('{job}', parsedArgs.job.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpscaleImageController::destroy
* @see app/Http/Controllers/UpscaleImageController.php:222
* @route '/api/upscale/{job}'
*/
destroy.delete = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::destroy
* @see app/Http/Controllers/UpscaleImageController.php:222
* @route '/api/upscale/{job}'
*/
const destroyForm = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UpscaleImageController::destroy
* @see app/Http/Controllers/UpscaleImageController.php:222
* @route '/api/upscale/{job}'
*/
destroyForm.delete = (args: { job: number | { id: number } } | [job: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

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

const UpscaleImageController = { history, store, show, destroy, index }

export default UpscaleImageController