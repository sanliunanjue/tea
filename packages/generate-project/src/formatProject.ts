import * as path from 'path';
import * as fse from 'fs-extra';

export default async function formatProject(projectDir: string, projectName?: string, ejsOptions: any = {}): Promise<void> {
  await fse.remove(path.join(projectDir, 'build'));

  const { targets = [] } = ejsOptions;
  let abcData = {};
  const abcPath = path.join(projectDir, 'abc.json');
  const pkgPath = path.join(projectDir, 'package.json');
  const miniProjectJsonPath = path.join(projectDir, 'mini.project.json');
  const appJSONPath = path.join(projectDir, 'src/app.json');
  const pkgData = fse.readJsonSync(pkgPath);
  const initialVersion = '0.1.0';

  pkgData.dependencies = pkgData.dependencies || {};
  pkgData.devDependencies = pkgData.devDependencies || {};

  // 通过 pkg.bizTeam 定制生成逻辑
  const bizTeam: 'govfe' | null = pkgData.bizTeam;

  console.log('clean package.json...');

  // modify package.json
  if (bizTeam !== 'govfe') {
    pkgData.private = true;
  }
  pkgData.originTemplate = pkgData.name;
  if (projectName) {
    pkgData.name = projectName;
  }
  pkgData.version = initialVersion;
  delete pkgData.files;
  delete pkgData.bizTeam;
  delete pkgData.publishConfig;
  delete pkgData.scaffoldConfig;
  delete pkgData.homepage;
  if (pkgData.scripts) {
    delete pkgData.scripts.screenshot;
    delete pkgData.scripts.prepublishOnly;
  }
  delete pkgData.devDependencies['@ice/screenshot'];

  // modify build.json
  const buildJsonPath = path.join(projectDir, 'build.json');
  if (fse.existsSync(buildJsonPath)) {
    const buildData = fse.readJsonSync(buildJsonPath);
    buildData.plugins = buildData.plugins || [];

    delete buildData.publicPath;

    delete buildData.web?.pha;


    // delete build-plugin-fusion-material
    const index = buildData.plugins.findIndex((item) => {
      const pluginName = typeof item === 'string' ? item : item[0];
      return pluginName === 'build-plugin-fusion-material';
    });
    if (index !== -1) {
      buildData.plugins.splice(index, 1);
      delete pkgData.devDependencies['build-plugin-fusion-material'];
    }

    fse.writeJSONSync(buildJsonPath, buildData, {
      spaces: 2,
    });
  } else if (pkgData.devDependencies['ice-scripts']) {
    const buildVersion = pkgData.devDependencies['ice-scripts'];
    // ^1.y.z, ~1.y.z, 1.x
    const is1X = /^(\^|~|)1\./.test(buildVersion);
    abcData = {
      type: 'ice-scripts',
      builder: is1X ? '@ali/builder-iceworks' : '@ali/builder-ice-scripts',
    };

    if (is1X &&  pkgData.buildConfig) {
      delete pkgData.buildConfig.output;
      delete pkgData.buildConfig.localization;
    }
  }

  fse.writeJSONSync(pkgPath, pkgData, {
    spaces: 2,
  });
}
