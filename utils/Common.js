/* eslint-disable array-callback-return */
export const readXPath = (element) => {
  // if (element.id !== '') { // 判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
  //   return '//*[@id="' + element.id + '"]';
  // }

  // if (element.getAttribute('class') !== null) {
  //   return '//*[@class="' + element.getAttribute('class') + '"]';
  // }
  // 因为Xpath属性不止id和class，所以还可以根据class形式添加属性
  // 这里需要需要主要字符串转译问题
  if (element === document.body) { // 递归到body处，结束递归
    return '/html/' + element.tagName.toLowerCase()
  }
  if (element.id) {
    return '//*[@id="' + element.id + '"]'
  }

  if (!element.parentNode) {
    return
  }
  let ix = 0; let // 在nodelist中的位置，且每次点击初始化
    siblings = element.parentNode.childNodes;// 同级的子元素
  const nodeNames = [...siblings].map((item) => {
    if (item !== element) {
      return item.nodeName
    }
  })
  for (let i = 0, l = siblings.length; i < l; i++) {
    let sibling = siblings[i];
    if (sibling === element) { // 如果这个元素是siblings数组中的元素，则执行递归操作
      if (siblings.length === 1) {
        return readXPath(element.parentNode) + '/' + element.tagName.toLowerCase()
      } else if (!nodeNames.includes(element.nodeName)) {
        return readXPath(element.parentNode) + '/' + element.tagName.toLowerCase()
      } else {
        return readXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']'
      }
    } else if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++;
    }
  }
}

// export const readXPath = (element) => {
//   const xpathOrigin = readOriginXPath(element)
//   if (/\[1\]$/.test(xpathOrigin)) {
//     return xpathOrigin.replace(/\[1\]/g, '') + '[1]'
//   } else {
//     return xpathOrigin.replace(/\[1\]/g, '')
//   }
// }
