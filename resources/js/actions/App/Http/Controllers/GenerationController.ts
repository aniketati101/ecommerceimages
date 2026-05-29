import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\GenerationController::generationDetail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
export const generationDetail = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generationDetail.url(args, options),
    method: 'get',
})

generationDetail.definition = {
    methods: ["get","head"],
    url: '/dashboard/generations/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GenerationController::generationDetail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
generationDetail.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return generationDetail.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::generationDetail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
generationDetail.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generationDetail.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::generationDetail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
generationDetail.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generationDetail.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GenerationController::generationDetail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
const generationDetailForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generationDetail.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::generationDetail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
generationDetailForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generationDetail.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GenerationController::generationDetail
* @see app/Http/Controllers/GenerationController.php:144
* @route '/dashboard/generations/{id}'
*/
generationDetailForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generationDetail.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

generationDetail.form = generationDetailForm

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

/**
* @see \App\Http\Controllers\GenerationController::destroyOutput
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
export const destroyOutput = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyOutput.url(args, options),
    method: 'delete',
})

destroyOutput.definition = {
    methods: ["delete"],
    url: '/dashboard/generations/{generationId}/outputs/{outputId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\GenerationController::destroyOutput
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
destroyOutput.url = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions) => {

    if (Array.isArray(args)) {
        args = {
            generationId: args[0],
            outputId: args[1],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        generationId: args.generationId,
        outputId: args.outputId,
    }

    return destroyOutput.definition.url
            .replace('{generationId}', parsedArgs.generationId.toString())
            .replace('{outputId}', parsedArgs.outputId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::destroyOutput
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
destroyOutput.delete = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyOutput.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\GenerationController::destroyOutput
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
const destroyOutputForm = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyOutput.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GenerationController::destroyOutput
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
destroyOutputForm.delete = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyOutput.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyOutput.form = destroyOutputForm

const GenerationController = { index, show, store, generations, generationDetail, edit, update, destroyOutput }

export default GenerationController