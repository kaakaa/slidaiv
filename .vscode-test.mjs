import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
	{
		label: 'unit',
		files: 'out/src/**/*.test.js',
		mocha: {
			require: '@babel/register',
		},
	}
]);
