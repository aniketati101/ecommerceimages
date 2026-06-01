import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VirtualModelController::index
* @see app/Http/Controllers/VirtualModelController.php:24
* @route '/dashboard/virtual-models'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard/virtual-models',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VirtualModelController::index
* @see app/Http/Controllers/VirtualModelController.php:24
* @route '/dashboard/virtual-models'
*/
index.url = (options?: RouteQueryOptions) => {




    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VirtualModelController::index
* @see app/Http/Controllers/VirtualModelController.php:24
* @route '/dashboard/virtual-models'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VirtualModelController::index
* @see app/Http/Controllers/VirtualModelController.php:24
* @route '/dashboard/virtual-models'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\VirtualModelController::index
* @see app/Http/Controllers/VirtualModelController.php:24
* @route '/dashboard/virtual-models'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VirtualModelController::index
* @see app/Http/Controllers/VirtualModelController.php:24
* @route '/dashboard/virtual-models'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VirtualModelController::index
* @see app/Http/Controllers/VirtualModelController.php:24
* @route '/dashboard/virtual-models'
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
* @see \App\Http\Controllers\VirtualModelController::create
* @see app/Http/Controllers/VirtualModelController.php:45
* @route '/dashboard/virtual-models/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/dashboard/virtual-models/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VirtualModelController::create
* @see app/Http/Controllers/VirtualModelController.php:45
* @route '/dashboard/virtual-models/create'
*/
create.url = (options?: RouteQueryOptions) => {




    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VirtualModelController::create
* @see app/Http/Controllers/VirtualModelController.php:45
* @route '/dashboard/virtual-models/create'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VirtualModelController::create
* @see app/Http/Controllers/VirtualModelController.php:45
* @route '/dashboard/virtual-models/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VirtualModelController::create
* @see app/Http/Controllers/VirtualModelController.php:45
* @route '/dashboard/virtual-models/create'
*/
createForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

create.form = createForm

/**
* @see \App\Http\Controllers\VirtualModelController::destroy
* @see app/Http/Controllers/VirtualModelController.php:113
* @route '/dashboard/virtual-models/{virtualModel}'
*/
export const destroy = (args: { virtualModel: number | { id: number } } | [virtualModel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/dashboard/virtual-models/{virtualModel}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\VirtualModelController::destroy
* @see app/Http/Controllers/VirtualModelController.php:113
* @route '/dashboard/virtual-models/{virtualModel}'
*/
destroy.url = (args: { virtualModel: number | { id: number } } | [virtualModel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { virtualModel: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { virtualModel: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            virtualModel: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        virtualModel: typeof args.virtualModel === 'object'
        ? args.virtualModel.id
        : args.virtualModel,
    }

    return destroy.definition.url
            .replace('{virtualModel}', parsedArgs.virtualModel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VirtualModelController::destroy
* @see app/Http/Controllers/VirtualModelController.php:113
* @route '/dashboard/virtual-models/{virtualModel}'
*/
destroy.delete = (args: { virtualModel: number | { id: number } } | [virtualModel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\VirtualModelController::destroy
* @see app/Http/Controllers/VirtualModelController.php:113
* @route '/dashboard/virtual-models/{virtualModel}'
*/
const destroyForm = (args: { virtualModel: number | { id: number } } | [virtualModel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VirtualModelController::destroy
* @see app/Http/Controllers/VirtualModelController.php:113
* @route '/dashboard/virtual-models/{virtualModel}'
*/
destroyForm.delete = (args: { virtualModel: number | { id: number } } | [virtualModel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const VirtualModelController = { index, create, destroy }

export default VirtualModelController