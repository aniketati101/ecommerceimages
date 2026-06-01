import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ImageEditController::edit
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/dashboard/edit-image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ImageEditController::edit
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
edit.url = (options?: RouteQueryOptions) => {




    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageEditController::edit
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::edit
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ImageEditController::edit
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::edit
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::edit
* @see app/Http/Controllers/ImageEditController.php:27
* @route '/dashboard/edit-image'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

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

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:75
* @route '/dashboard/edits'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard/edits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:75
* @route '/dashboard/edits'
*/
index.url = (options?: RouteQueryOptions) => {




    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:75
* @route '/dashboard/edits'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:75
* @route '/dashboard/edits'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:75
* @route '/dashboard/edits'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:75
* @route '/dashboard/edits'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::index
* @see app/Http/Controllers/ImageEditController.php:75
* @route '/dashboard/edits'
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
* @see \App\Http\Controllers\ImageEditController::show
* @see app/Http/Controllers/ImageEditController.php:92
* @route '/dashboard/edits/{imageEdit}'
*/
export const show = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/dashboard/edits/{imageEdit}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ImageEditController::show
* @see app/Http/Controllers/ImageEditController.php:92
* @route '/dashboard/edits/{imageEdit}'
*/
show.url = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { imageEdit: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { imageEdit: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            imageEdit: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        imageEdit: typeof args.imageEdit === 'object'
        ? args.imageEdit.id
        : args.imageEdit,
    }

    return show.definition.url
            .replace('{imageEdit}', parsedArgs.imageEdit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageEditController::show
* @see app/Http/Controllers/ImageEditController.php:92
* @route '/dashboard/edits/{imageEdit}'
*/
show.get = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::show
* @see app/Http/Controllers/ImageEditController.php:92
* @route '/dashboard/edits/{imageEdit}'
*/
show.head = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ImageEditController::show
* @see app/Http/Controllers/ImageEditController.php:92
* @route '/dashboard/edits/{imageEdit}'
*/
const showForm = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::show
* @see app/Http/Controllers/ImageEditController.php:92
* @route '/dashboard/edits/{imageEdit}'
*/
showForm.get = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageEditController::show
* @see app/Http/Controllers/ImageEditController.php:92
* @route '/dashboard/edits/{imageEdit}'
*/
showForm.head = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\ImageEditController::poll
* @see app/Http/Controllers/ImageEditController.php:108
* @route '/dashboard/edits/{imageEdit}/poll'
*/
export const poll = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: poll.url(args, options),
    method: 'post',
})

poll.definition = {
    methods: ["post"],
    url: '/dashboard/edits/{imageEdit}/poll',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ImageEditController::poll
* @see app/Http/Controllers/ImageEditController.php:108
* @route '/dashboard/edits/{imageEdit}/poll'
*/
poll.url = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { imageEdit: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { imageEdit: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            imageEdit: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        imageEdit: typeof args.imageEdit === 'object'
        ? args.imageEdit.id
        : args.imageEdit,
    }

    return poll.definition.url
            .replace('{imageEdit}', parsedArgs.imageEdit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageEditController::poll
* @see app/Http/Controllers/ImageEditController.php:108
* @route '/dashboard/edits/{imageEdit}/poll'
*/
poll.post = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: poll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ImageEditController::poll
* @see app/Http/Controllers/ImageEditController.php:108
* @route '/dashboard/edits/{imageEdit}/poll'
*/
const pollForm = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: poll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ImageEditController::poll
* @see app/Http/Controllers/ImageEditController.php:108
* @route '/dashboard/edits/{imageEdit}/poll'
*/
pollForm.post = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: poll.url(args, options),
    method: 'post',
})

poll.form = pollForm

/**
* @see \App\Http\Controllers\ImageEditController::destroy
* @see app/Http/Controllers/ImageEditController.php:125
* @route '/dashboard/edits/{imageEdit}'
*/
export const destroy = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/dashboard/edits/{imageEdit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ImageEditController::destroy
* @see app/Http/Controllers/ImageEditController.php:125
* @route '/dashboard/edits/{imageEdit}'
*/
destroy.url = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { imageEdit: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { imageEdit: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            imageEdit: args[0],
        }
    }

    args = applyUrlDefaults(args)


    const parsedArgs = {
        imageEdit: typeof args.imageEdit === 'object'
        ? args.imageEdit.id
        : args.imageEdit,
    }

    return destroy.definition.url
            .replace('{imageEdit}', parsedArgs.imageEdit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageEditController::destroy
* @see app/Http/Controllers/ImageEditController.php:125
* @route '/dashboard/edits/{imageEdit}'
*/
destroy.delete = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ImageEditController::destroy
* @see app/Http/Controllers/ImageEditController.php:125
* @route '/dashboard/edits/{imageEdit}'
*/
const destroyForm = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ImageEditController::destroy
* @see app/Http/Controllers/ImageEditController.php:125
* @route '/dashboard/edits/{imageEdit}'
*/
destroyForm.delete = (args: { imageEdit: number | { id: number } } | [imageEdit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const ImageEditController = { edit, store, index, show, poll, destroy }

export default ImageEditController