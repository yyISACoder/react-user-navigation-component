/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-useless-escape */
import React from 'react'
import { injectIntl } from 'react-intl'
import { Switch, Button, List } from 'solv-uicomponent'
import { setCookie, getCookieByName, message } from 'solv-common';
import Driver from './utils/Driver'
import './style/driver.min.css'
import HighlightBox from './HighlightBox'
import { readXPath } from './utils/Common'
import Lang from './Lang'
import './style/index.less'

class NavigationGuideline extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      switch: false,
      visible: false
    }
    this.currentIndex = 0
    this.currentItem = null
    this.selection = []
    this.isOver = true
    this.ignoreElements = ['nav-guide-switch', 'ant-switch-inner', 'nav-highlight-wrapper', 'nav-guide-btn', 'nav-guide-popover', 'nav-guide-submit-btn', 'navigation-guideline-wrapper']
    this.driver = new Driver({
      allowClose: false,
      overlayClickNext: false,
      animate: false,
      keyboardControl: false,
      onHighlighted: ({ popover: { options } }) => {
        this.isOver = false
        if (options.interactive === 1) {
          document.addEventListener('click', (e) => {
            if (!this.isOver) {
              const triggerElement = [...document.querySelectorAll(options.triggerElement)].find((item) => item === e.target)
              if (triggerElement) {
                setTimeout(() => {
                  this.initStep(this.navGuide)
                  this.driver.start(options.index + 1)
                }, 500)
              }
            }
          }, true)
        }
      },
      onDeselected: () => {
        if (!this.driver.isActivated) {
          this.isOver = true
        }
      }
    })
  }
  componentDidMount() {
    let navGuide = getCookieByName('navGuide')
    if (navGuide) {
      setTimeout(() => {
        this.navGuide = JSON.parse(navGuide)
        this.initStep(this.navGuide)
        this.driver.start(0)
      }, 3000)
    }
  }
  onPick = () => {
    document.addEventListener('mousemove', this.onMousemove)
    document.addEventListener('mouseout', this.onMouseout)
    document.addEventListener('click', this.onClick, true)
  }
  onSelTrigger = (visible) => {
    this.setState({
      visible
    })
  }
  onClose = () => {
    this.onContinue()
    this.setState({
      visible: false
    })
  }
  onUpdate = (v) => {
    this.selection[v.index].desc = v.desc
    this.selection[v.index].interactive = v.interactive
    this.selection[v.index].triggerElement = v.triggerElement
    this.setState({
      visible: false
    })
  }
  onChange = (v) => {
    this.setState({
      switch: v
    })
    if (v) {
      // this.startToPick()
    } else {
      this.stopToPick()
      // this.htmlElementPicker.stop()
      // this.selection = []
      // document.querySelectorAll('.nav-highlight-wrapper').forEach((item) => {
      //   item.remove()
      // })
    }
  }
  onConfirm = () => {
    if (!this.selection.length) {
      message.warning(this.props.intl.formatMessage(Lang.warning))
      return
    }
    this.selection.forEach((item) => {
      delete item.target
      delete item.originTarget
    })
    setCookie('navGuide', JSON.stringify(this.selection), 30)
    message.success(this.props.intl.formatMessage(Lang.success))
  }
  onCancle = () => {
    if (!this.selection.length) {
      message.warning(this.props.intl.formatMessage(Lang.clearWarning))
      return
    }
    this.selection = []
    this.currentIndex = 0
    this.currentItem = null
    document.querySelectorAll('[nav-guide-selected]').forEach((item) => {
      const originBg = item.getAttribute('nav-origin-bg-color')
      const originCursor = item.getAttribute('nav-origin-bg-cursor')
      item.removeAttribute('nav-guide-selected')
      item.style.backgroundColor = originBg
      item.style.cursor = originCursor
    })
    this.setState({
      visible: false
    })
    message.success(this.props.intl.formatMessage(Lang.clearSuccess))
  }
  onContinue = (v) => {
    this.startToPick()
    if (v) {
      message.info(this.props.intl.formatMessage(Lang.onContinue))
    }
  }
  onPause = (v) => {
    document.removeEventListener('mousemove', this.onMousemove)
    document.removeEventListener('mouseout', this.onMouseout)
    document.removeEventListener('click', this.onClick, true)
    if (v) {
      message.info(this.props.intl.formatMessage(Lang.onPause))
    }
  }
  onMousemove = (e) => {
    const target = e.target
    if (target.dataset.navHover !== 'true' &&
        !this.judgeIsIgnore(target)
    ) {
      if (!target.dataset.originBgColor) {
        const bgColor = window.getComputedStyle(target).backgroundColor
        target.dataset.originBgColor = bgColor
      }
      target.style.backgroundColor = '#0076ce61'
      target.dataset.navHover = 'true'
    }
  }
  onMouseout = (e) => {
    const target = e.target
    if (target.dataset.navHover === 'true' &&
        !this.judgeIsIgnore(target)
    ) {
      const bgColor = target.dataset.originBgColor
      target.style.backgroundColor = bgColor
      target.dataset.navHover = 'false'
    }
  }
  onDel = (currentItem) => {
    const target = currentItem.target
    const index = this.selection.findIndex((item) => item.target === target)
    this.selection.splice(index, 1)
    const originBg = target.getAttribute('nav-origin-bg-color')
    const originCursor = target.getAttribute('nav-origin-bg-cursor')
    target.style.backgroundColor = originBg
    target.style.cursor = originCursor
    if (/slick-list/.test(target.className)) {
      const originTarget = currentItem.originTarget
      const originBgReal = originTarget.getAttribute('nav-origin-bg-color')
      const originCursorReal = originTarget.getAttribute('nav-origin-bg-cursor')
      originTarget.style.backgroundColor = originBgReal
      originTarget.style.cursor = originCursorReal
    }

    this.setState({
      visible: false
    })
    this.onContinue()
  }
  onClick = (e) => {
    let target = e.target
    debugger
    if (!this.judgeIsIgnore(target)) {
      const index = this.selection.findIndex((item) => item.target === target)
      if (index === -1) {
        if (target.id) {
          this.selection.push({
            type: 'id',
            id: '#' + target.id,
            interactive: 0,
            desc: '',
            target
          })
        } else {
          this.selection.push({
            type: 'xpath',
            xpath: readXPath(target),
            interactive: 0,
            desc: '',
            target
          })
        }
        const indexCurrent = this.selection.length - 1
        this.currentIndex = indexCurrent
        this.currentItem = this.selection[indexCurrent]
        this.onPause()
        this.setState({
          visible: true
        })
        const bgColor = target.dataset.originBgColor
        target.style.backgroundColor = bgColor
      } else {
        message.warning(formatMessage(Lang.pickWarning))
      }
    }
    e.stopPropagation()
  }
  onEditEle = (item) => {
    debugger
  }
  judgeIsIgnore = (target) => {
    let isIgnore = false
    this.ignoreElements.forEach((item) => {
      const reg = new RegExp(item)
      if (reg.test(target.className)) {
        isIgnore = true
      }
    })
    return isIgnore
  }
  startToPick = () => {
    document.addEventListener('mousemove', this.onMousemove)
    document.addEventListener('mouseout', this.onMouseout)
    document.addEventListener('click', this.onClick, true)
  }
  stopToPick = () => {
    document.removeEventListener('mousemove', this.onMousemove)
    document.removeEventListener('mouseout', this.onMouseout)
    document.removeEventListener('click', this.onClick, true)
    this.selection = []
    document.querySelectorAll('[nav-guide-selected]').forEach((item) => {
      const originBg = item.getAttribute('nav-origin-bg-color')
      const originCursor = item.getAttribute('nav-origin-bg-cursor')
      item.removeAttribute('nav-guide-selected')
      item.style.backgroundColor = originBg
      item.style.cursor = originCursor
    })
    this.setState({
      visible: false
    })
  }
  initStep = (navGuide) => {
    const steps = []
    for (let i = 0; i < navGuide.length; i++) {
      let element
      if (navGuide[i].type === 'id') {
        element = navGuide[i].id
      } else {
        element = navGuide[i].xpath
      }
      const interactive = Number(navGuide[i].interactive)
      steps.push({
        element,
        popover: {
          index: i,
          triggerElement: interactive === 0 ? '' : navGuide[i].triggerElement,
          showButtons: interactive === 0,
          interactive,
          className: 'nav-guide-step-popover-class',
          title: this.props.intl.formatMessage(Lang.step) + (i + 1),
          description: navGuide[i].desc
        }
      })
    }

    this.driver.defineSteps(steps)
  }
  render() {
    const {
      intl: {
        formatMessage
      }
    } = this.props
    return (
      <div
        id="navGuidelineWrapper"
        className="navigation-guideline-wrapper"
      >
        <HighlightBox
          onDel={this.onDel}
          judgeIsIgnore={this.judgeIsIgnore}
          visible={this.state.visible}
          currentItem={this.currentItem}
          index={this.currentIndex}
          onSelTrigger={this.onSelTrigger}
          onClose={this.onClose}
          onUpdate={this.onUpdate}
        />

        <Switch
          size="large"
          className="nav-guide-switch"
          onChange={this.onChange}
          checkedChildren={formatMessage(Lang.startToPick)}
          unCheckedChildren={formatMessage(Lang.stopPick)}
        />
        {
          this.state.switch && (
            <>
              <Button
                className="nav-guide-btn"
                data-bizdes="nav-guid-confirm"
                color="primary"
                style={{ margin: '0 4px 0 8px' }}
                onClick={this.onConfirm}
              >{formatMessage(Lang.confirm)}
              </Button>
              <Button
                color="primary"
                className="nav-guide-btn"
                data-bizdes="nav-guid-hidden"
                style={{ margin: '0 4px 0 0' }}
                onClick={this.onPick}
              >
                {formatMessage(Lang.pick)}
              </Button>
              {/* <Button
                color="primary"
                className="nav-guide-btn"
                data-bizdes="nav-guid-hidden"
                style={{ margin: '0 4px 0 0' }}
                onClick={this.onPause.bind(null, true)}
              >
                {formatMessage(Lang.pause)}
              </Button> */}
              <Button
                className="nav-guide-btn"
                data-bizdes="nav-guid-cancel"
                onClick={this.onCancle}
              >
                {formatMessage(Lang.cancel)}
              </Button>
              <List
                data-bizdes="nav-guide-list"
                header={formatMessage(Lang.choosedEle)}
                dataSource={this.selection}
                renderItem={(item) => (
                  <List.Item onClick={this.onEditEle.bind(null, item)}>
                    {item.type === 'id' ? item.id : item.xpath}
                  </List.Item>
                  )
                }
              />
            </>
          )
        }
      </div>
    )
  }
}

export default injectIntl(NavigationGuideline)
