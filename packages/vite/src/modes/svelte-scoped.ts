import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
import { defaultExclude } from '../integration'

export function SvelteScopedPlugin({ uno, ready }: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.svelte$/], defaultExclude)

  async function transformSFC(code: string, id: string) {
    const preflights = code.includes('uno:preflights')
    const safelist = code.includes('uno:safelist')

    const { css } = await uno.generate(code, { id, preflights, safelist })
    if (!css)
      return null
    if (code.match(/<style[^>]*>[\s\S]*?<\/style\s*>/))
      return code.replace(/(<style[^>]*>)/, `$1${css}`)
    return `${code}\n<style>${css}</style>`
  }

  return {
    name: 'unocss:svelte-scoped',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ready
      filter = createFilter(
        config.include || [/\.svelte$/],
        config.exclude || defaultExclude,
      )
    },
    transform(code, id) {
      if (!filter(id))
        return
      return transformSFC(code, id)
    },
    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return await transformSFC(code, ctx.file) || code
        }
      }
    },
  }
}
