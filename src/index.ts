import { IApi } from '@umijs/types';
import { chalk, chokidar } from '@umijs/utils';
import { resolve } from 'path';
import { reactSVGGeneratorFromSVGDir } from './utils';
export default (api: IApi) => {
  api.describe({
    key: 'mock',
    config: {
      schema(joi) {
        return joi.object({
          entry: joi.string().required(),
          ignorePath: joi.string(),
          alias: joi.string().default('@svgs'),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  const { svgs } = api.userConfig;
  const svgsOutput = resolve(api.paths.absTmpPath!, 'plugin-svgs');

  if (svgs === undefined) {
    return;
  }
  const { entry, alias = '@svgs' } = svgs;

  if (entry === undefined) {
    console.log(chalk.red('请设置 svg 的文件目录: `svgs.entry`'));
  }

  api.chainWebpack((config) => {
    config.resolve.alias.set(alias, svgsOutput);
    return config;
  });

  api.modifyBabelPresetOpts((opts) => {
    return {
      ...opts,
      import: (opts.import || []).concat([
        {
          libraryName: alias,
          libraryDirectory: 'svgs',
          camel2DashComponentName: false,
        },
      ]),
    };
  });

  api.onGenerateFiles(() => {
    reactSVGGeneratorFromSVGDir({
      entry,
      output: svgsOutput,
    });
    console.log(chalk.green('生成 SVG COMPONENT 成功'));
  });

  async function growthGenerateSvg(SVGPath: string) {
    await reactSVGGeneratorFromSVGDir({
      entry,
      output: svgsOutput,
    });
    console.log(chalk.green('生成 SVG COMPONENT 成功'));
  }

  if (api.env === 'development') {
    chokidar
      .watch(entry, {
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
      })
      .on('add', growthGenerateSvg)
      .on('change', growthGenerateSvg)
      .on('unlink', growthGenerateSvg);
  }
};
