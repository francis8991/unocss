import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['cjs'],
  entryPoints: [
    'src/index.ts',
  ],
  target: 'node14',
  clean: true,
  dts: true,
}

export default config