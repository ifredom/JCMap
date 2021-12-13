import path from 'path'
import { defineConfig } from 'vite'
import pkg from './package.json'

const resolve = dir => path.join(__dirname, dir)
const { dependencies, devDependencies, name, version } = pkg
const __APP_INFO__ = {
	pkg: { dependencies, devDependencies, name, version }
}

// 根据环境变量配置代理 https://blog.csdn.net/chendf__/article/details/115676683
// https://vitejs.dev/config/
export default ({ command, mode }) => {
	const root = process.cwd()

	return defineConfig({
		root, // 项目根目录（index.html 文件所在的位置）
		base: './', // 开发或生产环境服务的 公共基础路径
		mode, //  serve 时默认 'development'，build 时默认 'production'
		//定义全局变量替换方式。每项在开发时会被定义为全局变量，而在构建时则是静态替换。
		define: {
			__APP_INFO__: JSON.stringify(__APP_INFO__)
		},
		//插件数组
		plugins: [],
		publicDir: 'public', //作为静态资源服务的文件夹
		resolve: {
			//路径别名
			alias: {},
			// dedupe:string[], //将列出的依赖关系解析到相同的副本
			// conditions:string[], // 在解析包的 情景导出 时允许的附加条件。
			mainFields: ['module', 'jsnext:main', 'jsnext'], //package.json 中，在解析包的入口点时尝试的字段列表
			extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'] // 导入时想要省略的扩展名列表
		},
		css: {
			// modules, //配置 CSS modules 的行为。选项将被传递给 postcss-modules。
			// postcss, // 内联的 PostCSS 配置（格式同 postcss.config.js）, 根据不同浏览器兼容增加前缀的规则
			//指定传递给 CSS 预处理器的选项
			preprocessorOptions: {
				scss: {
					//添加 全局变量
					additionalData: '@use "@/styles/global.scss" as *;'
				}
			}
		},
		json: {
			namedExports: true, // 是否支持从 .json 文件中进行按名导入
			stringify: false // 若设置为 true，导入的 JSON 会被转换为 export default JSON.parse("...") 会比转译成对象字面量性能更好，尤其是当 JSON 文件较大的时候。
		},

		//ESBuildOptions 继承自 esbuild 转换选项。最常见的用例是自定义 JSX：
		// esbuild: {
		//   jsxFactory: 'h',
		//   jsxFragment: 'Fragment'
		// },

		// assetsInclude, // 指定其他文件类型作为静态资源处理（这样导入它们就会返回解析后的 URL）

		logLevel: 'info', // 调整控制台输出的级别

		clearScreen: true, // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息

		server: {
			//服务器主机名
			host: '0.0.0.0',
			//端口号
			port: 3000,
			//设为 true 时若端口已被占用则会直接退出，而不是尝试下一个可用端口
			strictPort: false,
			//服务器启动时自动在浏览器中打开应用程序,当此值为字符串时，会被用作 URL 的路径名
			open: true
			//自定义代理规则

			// cors, //为开发服务器配置 CORS。默认启用并允许任何源，传递一个 选项对象 来调整行为或设为 false 表示禁用。
			// force, // 设置为 true 强制使依赖预构建。

			// 禁用或配置 HMR 连接（用于 HMR websocket 必须使用不同的 http 服务器地址的情况）。
			// hmr,       //设置 hmr.overlay 为 false 可以禁用服务器错误遮罩层。

			// watch, // 传递给 chokidar 的文件系统监视器选项。
		},
		build: {
			// target: 'es2015', //构建的浏览器兼容目标
			outDir: 'dist', //输出路径
			assetsDir: 'assets', //指定生成静态资源的存放路径
			assetsInlineLimit: 4096, // 4kb 小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求
			cssCodeSplit: true, //启用/禁用 CSS 代码拆分,禁用，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
			sourcemap: false, //构建后是否生成 source map 文件
			//自定义底层的 Rollup 打包配置
			rollupOptions: {
				input: {
					main: resolve(__dirname, 'index.html')
				}
			},
			// commonjsOptions:RollupCommonJSOptions, //传递给 @rollup/plugin-commonjs 插件的选项配置。
			// lib:{ entry: string, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[] },  //暴露全局变量,不打包进到文件，依赖进行外部化
			manifest: false, //后端集成,生成 manifest.json 文件
			minify: 'terser', // 禁用最小化混淆，或是用来指定使用哪种混淆器 ,terser 相对较慢，但大多数情况下构建后的文件体积更小
			// terserOptions:TerserOptions, //传递给 Terser 的更多 minify 选项。
			terserOptions: {
				compress: {
					//生产环境时移除console
					drop_console: true,
					drop_debugger: true
				}
			},
			write: true, //常用于 编程式地调用 build() 在写入磁盘之前，需要对构建后的文件进行进一步处理。
			emptyOutDir: true, //  若 outDir 在 root 目录下，则为 true
			brotliSize: true, //启用/禁用 brotli 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能。
			chunkSizeWarningLimit: 500 //chunk 大小警告的限制（以 kbs 为单位）。
		},
		// 依赖优化选项 - 依赖预构建
		optimizeDeps: {
			// entries, // 默认情况下，Vite 会抓取你的 index.html 来检测需要预构建的依赖项
			// exclude:string[], // 在预构建中强制排除的依赖项。
			// include:string[], // 默认情况下，不在 node_modules 中的，链接的包不会被预构建。使用此选项可强制预构建链接的包。
		}

		// ssr:{
		// external:string[], // 列出的是要为 SSR 强制外部化的依赖。
		// noExternal:string[],// 列出的是防止被 SSR 外部化依赖项。
		// }
	})
}
