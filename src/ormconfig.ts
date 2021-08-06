import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  host: 'ec2-52-209-171-51.eu-west-1.compute.amazonaws.com',
  port: 5432,
  username: 'kopbbmrzumosoc',
  password: 'e58800d7eed53f14d5ded4d2509efde0f930a7da772674f64dd6ff60c4a284ca',
  database: 'd2gnjhpdmijqkv',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default config;
