/**
 * 判断数据类型函数
 * @param {*} value  any
 */
export function toRawType(value) {
	return Object.prototype.toString.call(value).slice(8, -1)
}

/** Object 类型 **/
export function isObject(val) {
	return toRawType(val) === 'Object'
}
/** 字符串 类型 **/
export function isString(val) {
	return typeof val === 'string' || val instanceof String
}
/**
 * 16进制颜色转为RGB格式
 * @param {*} sHex  16进制颜色
 * @param {*} opacity 透明度
 */
export function toColorRgba(sHex, opacity = 1) {
	// 十六进制颜色值的正则表达式
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/
	/* 16进制颜色转为RGB格式 */
	var sColor = sHex.toLowerCase()
	var alpha = 1
	if (sColor && reg.test(sColor)) {
		if (sColor.length === 4 || sColor.length === 5) {
			var sColorNew = '#'
			for (var i = 1; i < sColor.length; i += 1) {
				sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
			}
			sColor = sColorNew
		}
		// 如果有透明度再执行
		if (sColor.length === 9) {
			alpha = (parseInt('0x' + sColor.slice(7, 9)) / 255).toFixed(2)
		}
		alpha = Number(opacity) !== 1 ? alpha : Number(opacity)
		//  处理六位的颜色值
		var sColorChange = []
		for (var i = 1; i < 7; i += 2) {
			sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
		}
		return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')'
	} else {
		return sColor
	}
}

/**
 * 深度拷贝
 * @param {*} target  克隆对象
 * @param {*} map 解决循环引用
 */
export function deepClone(target, map = new WeakMap()) {
	const mapTag = '[object Map]'
	const setTag = '[object Set]'
	const arrayTag = '[object Array]'
	const objectTag = '[object Object]'
	const argsTag = '[object Arguments]'

	const boolTag = '[object Boolean]'
	const dateTag = '[object Date]'
	const numberTag = '[object Number]'
	const stringTag = '[object String]'
	const symbolTag = '[object Symbol]'
	const errorTag = '[object Error]'
	const regexpTag = '[object RegExp]'
	const funcTag = '[object Function]'

	const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag]
	function forEach(array, iteratee) {
		let index = -1
		const length = array.length
		while (++index < length) {
			iteratee(array[index], index)
		}
		return array
	}

	function isObject(target) {
		const type = typeof target
		return target !== null && (type === 'object' || type === 'function')
	}

	function getType(target) {
		return Object.prototype.toString.call(target)
	}

	function getInit(target) {
		const Ctor = target.constructor
		return new Ctor()
	}

	function cloneSymbol(targe) {
		return Object(Symbol.prototype.valueOf.call(targe))
	}

	function cloneReg(targe) {
		const reFlags = /\w*$/
		const result = new targe.constructor(targe.source, reFlags.exec(targe))
		result.lastIndex = targe.lastIndex
		return result
	}

	function cloneFunction(func) {
		const bodyReg = /(?<={)(.|\n)+(?=})/m
		const paramReg = /(?<=\().+(?=\)\s+{)/
		const funcString = func.toString()
		if (func.prototype) {
			const param = paramReg.exec(funcString)
			const body = bodyReg.exec(funcString)
			if (body) {
				if (param) {
					const paramArr = param[0].split(',')
					return new Function(...paramArr, body[0])
				} else {
					return new Function(body[0])
				}
			} else {
				return null
			}
		} else {
			return eval(funcString)
		}
	}

	function cloneOtherType(targe, type) {
		const Ctor = targe.constructor
		switch (type) {
			case boolTag:
			case numberTag:
			case stringTag:
			case errorTag:
			case dateTag:
				return new Ctor(targe)
			case regexpTag:
				return cloneReg(targe)
			case symbolTag:
				return cloneSymbol(targe)
			case funcTag:
				return cloneFunction(targe)
			default:
				return null
		}
	}
	// 克隆原始类型
	if (!isObject(target)) {
		return target
	}

	// 初始化
	const type = getType(target)
	let cloneTarget
	if (deepTag.includes(type)) {
		cloneTarget = getInit(target, type)
	} else {
		return cloneOtherType(target, type)
	}

	// 防止循环引用
	if (map.get(target)) {
		return map.get(target)
	}
	map.set(target, cloneTarget)

	// 克隆set
	if (type === setTag) {
		target.forEach(value => {
			cloneTarget.add(clone(value, map))
		})
		return cloneTarget
	}

	// 克隆map
	if (type === mapTag) {
		target.forEach((value, key) => {
			cloneTarget.set(key, deepClone(value, map))
		})
		return cloneTarget
	}

	// 克隆对象和数组
	const keys = type === arrayTag ? undefined : Object.keys(target)
	forEach(keys || target, (value, key) => {
		if (keys) {
			key = value
		}
		cloneTarget[key] = deepClone(target[key], map)
	})

	return cloneTarget
}
