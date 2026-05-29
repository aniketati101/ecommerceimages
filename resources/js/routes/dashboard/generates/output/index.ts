import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GenerationController::destroy
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
export const destroy = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/dashboard/generations/{generationId}/outputs/{outputId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\GenerationController::destroy
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
destroy.url = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions) => {

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

    return destroy.definition.url
            .replace('{generationId}', parsedArgs.generationId.toString())
            .replace('{outputId}', parsedArgs.outputId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GenerationController::destroy
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
destroy.delete = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\GenerationController::destroy
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
const destroyForm = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GenerationController::destroy
* @see app/Http/Controllers/GenerationController.php:173
* @route '/dashboard/generations/{generationId}/outputs/{outputId}'
*/
destroyForm.delete = (args: { generationId: string | number, outputId: string | number } | [generationId: string | number, outputId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm



const output = {
    destroy,
}

export default output