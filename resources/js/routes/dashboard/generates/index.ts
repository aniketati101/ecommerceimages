import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import output from './output'
/**
* @see \App\Http\Controllers\GenerationController::index
* @see app/Http/Controllers/GenerationController.php:33
* @route '/dashboard/generates'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard/generates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GenerationController::index
* @see app/Http/Controllers/GenerationController.php:33
* @route '/dashboard/generates'
*/
index.url = (options?: RouteQueryOptions) => {




    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::index
* @see app/Http/Controllers/GenerationController.php:33
* @route '/dashboard/generates'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::index
* @see app/Http/Controllers/GenerationController.php:33
* @route '/dashboard/generates'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GenerationController::index
* @see app/Http/Controllers/GenerationController.php:33
* @route '/dashboard/generates'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::index
* @see app/Http/Controllers/GenerationController.php:33
* @route '/dashboard/generates'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::index
* @see app/Http/Controllers/GenerationController.php:33
* @route '/dashboard/generates'
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
* @see \App\Http\Controllers\GenerationController::show
* @see app/Http/Controllers/GenerationController.php:48
* @route '/dashboard/generates/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/dashboard/generates/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GenerationController::show
* @see app/Http/Controllers/GenerationController.php:48
* @route '/dashboard/generates/{id}'
*/
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }


    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        id: args.id,
    }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::show
* @see app/Http/Controllers/GenerationController.php:48
* @route '/dashboard/generates/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::show
* @see app/Http/Controllers/GenerationController.php:48
* @route '/dashboard/generates/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GenerationController::show
* @see app/Http/Controllers/GenerationController.php:48
* @route '/dashboard/generates/{id}'
*/
const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::show
* @see app/Http/Controllers/GenerationController.php:48
* @route '/dashboard/generates/{id}'
*/
showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::show
* @see app/Http/Controllers/GenerationController.php:48
* @route '/dashboard/generates/{id}'
*/
showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\GenerationController::store
* @see app/Http/Controllers/GenerationController.php:55
* @route '/dashboard/generates/store'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/dashboard/generates/store',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GenerationController::store
* @see app/Http/Controllers/GenerationController.php:55
* @route '/dashboard/generates/store'
*/
store.url = (options?: RouteQueryOptions) => {




    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::store
* @see app/Http/Controllers/GenerationController.php:55
* @route '/dashboard/generates/store'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GenerationController::store
* @see app/Http/Controllers/GenerationController.php:55
* @route '/dashboard/generates/store'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GenerationController::store
* @see app/Http/Controllers/GenerationController.php:55
* @route '/dashboard/generates/store'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\GenerationController::generations
* @see app/Http/Controllers/GenerationController.php:114
* @route '/dashboard/generations'
*/
export const generations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generations.url(options),
    method: 'get',
})

generations.definition = {
    methods: ["get","head"],
    url: '/dashboard/generations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GenerationController::generations
* @see app/Http/Controllers/GenerationController.php:114
* @route '/dashboard/generations'
*/
generations.url = (options?: RouteQueryOptions) => {




    return generations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::generations
* @see app/Http/Controllers/GenerationController.php:114
* @route '/dashboard/generations'
*/
generations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::generations
* @see app/Http/Controllers/GenerationController.php:114
* @route '/dashboard/generations'
*/
generations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GenerationController::generations
* @see app/Http/Controllers/GenerationController.php:114
* @route '/dashboard/generations'
*/
const generationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::generations
* @see app/Http/Controllers/GenerationController.php:114
* @route '/dashboard/generations'
*/
generationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::generations
* @see app/Http/Controllers/GenerationController.php:114
* @route '/dashboard/generations'
*/
generationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generations.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

generations.form = generationsForm

/**
* @see \App\Http\Controllers\GenerationController::detail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
export const detail = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: detail.url(args, options),
    method: 'get',
})

detail.definition = {
    methods: ["get","head"],
    url: '/dashboard/generations/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GenerationController::detail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
detail.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }


    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        id: args.id,
    }

    return detail.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::detail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
detail.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: detail.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::detail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
detail.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: detail.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GenerationController::detail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
const detailForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: detail.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::detail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
detailForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: detail.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::detail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
detailForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: detail.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

detail.form = detailForm

/**
* @see \App\Http\Controllers\GenerationController::edit
* @see app/Http/Controllers/GenerationController.php:191
* @route '/dashboard/generates/{id}/edit'
*/
export const edit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/dashboard/generates/{id}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GenerationController::edit
* @see app/Http/Controllers/GenerationController.php:191
* @route '/dashboard/generates/{id}/edit'
*/
edit.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }


    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        id: args.id,
    }

    return edit.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::edit
* @see app/Http/Controllers/GenerationController.php:191
* @route '/dashboard/generates/{id}/edit'
*/
edit.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::edit
* @see app/Http/Controllers/GenerationController.php:191
* @route '/dashboard/generates/{id}/edit'
*/
edit.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GenerationController::edit
* @see app/Http/Controllers/GenerationController.php:191
* @route '/dashboard/generates/{id}/edit'
*/
const editForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::edit
* @see app/Http/Controllers/GenerationController.php:191
* @route '/dashboard/generates/{id}/edit'
*/
editForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::edit
* @see app/Http/Controllers/GenerationController.php:191
* @route '/dashboard/generates/{id}/edit'
*/
editForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\GenerationController::update
* @see app/Http/Controllers/GenerationController.php:203
* @route '/dashboard/generates/{id}/update'
*/
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/dashboard/generates/{id}/update',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GenerationController::update
* @see app/Http/Controllers/GenerationController.php:203
* @route '/dashboard/generates/{id}/update'
*/
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }


    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        id: args.id,
    }

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::update
* @see app/Http/Controllers/GenerationController.php:203
* @route '/dashboard/generates/{id}/update'
*/
update.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GenerationController::update
* @see app/Http/Controllers/GenerationController.php:203
* @route '/dashboard/generates/{id}/update'
*/
const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GenerationController::update
* @see app/Http/Controllers/GenerationController.php:203
* @route '/dashboard/generates/{id}/update'
*/
updateForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, options),
    method: 'post',
})

update.form = updateForm



const generates = {
    index,
    show,
    store,
    generations,
    detail,
    edit,
    update,
    output,
}

export default generates