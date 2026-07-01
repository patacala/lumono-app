module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      bcrypt: 'commonjs2 bcrypt',
      // @nestjs/terminus optional database adapters
      '@mikro-orm/core': 'commonjs2 @mikro-orm/core',
      '@mikro-orm/nestjs': 'commonjs2 @mikro-orm/nestjs',
      mongoose: 'commonjs2 mongoose',
      '@nestjs/mongoose': 'commonjs2 @nestjs/mongoose',
      sequelize: 'commonjs2 sequelize',
      'sequelize-typescript': 'commonjs2 sequelize-typescript',
      '@nestjs/sequelize': 'commonjs2 @nestjs/sequelize',
      typeorm: 'commonjs2 typeorm',
      '@nestjs/typeorm': 'commonjs2 @nestjs/typeorm',
      // Native deps
      'exceljs': 'commonjs2 exceljs',
      'bwip-js': 'commonjs2 bwip-js',
      helmet: 'commonjs2 helmet',
      compression: 'commonjs2 compression',
      'pino-pretty': 'commonjs2 pino-pretty',
      pino: 'commonjs2 pino',
      'pino-http': 'commonjs2 pino-http',
      redis: 'commonjs2 redis',
    },
  };
};
