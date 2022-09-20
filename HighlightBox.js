/* eslint-disable max-len */
import React from 'react'
import { injectIntl } from 'react-intl'
import { Modal, Form, Input, Button, Radio, Notes, Popconfirm } from 'solv-uicomponent'
import { message } from 'solv-common'
import { readXPath } from './utils/Common'
import Lang from './Lang'

class HighlightBox extends React.Component {
  onSelTrigger = () => {
    document.querySelector('.ant-modal-mask').style.display = 'none'
    document.querySelector('.ant-modal-wrap').style.display = 'none'
    document.addEventListener('mousemove', this.onMousemove)
    document.addEventListener('mouseout', this.onMouseout)
    document.addEventListener('click', this.onClick, true)
  }
  onMousemove = (e) => {
    const target = e.target
    if (!target.getAttribute('nav-guide-hover-trigger') &&
        !target.getAttribute('nav-guide-selected-trigger') &&
        !this.props.judgeIsIgnore(target)
    ) {
      if (!target.getAttribute('nav-origin-bg-color-trigger')) {
        const bgColor = window.getComputedStyle(target).backgroundColor
        const cursor = window.getComputedStyle(target).cursor
        target.setAttribute('nav-origin-bg-color-trigger', bgColor)
        target.setAttribute('nav-origin-bg-cursor-trigger', cursor)
      }
      target.setAttribute('nav-guide-hover-trigger', true)
      target.style.backgroundColor = '#0076ce61'
    }
  }
  onMouseout = (e) => {
    const target = e.target
    if (target.getAttribute('nav-guide-hover-trigger') &&
        !target.getAttribute('nav-guide-selected-trigger') &&
        !this.props.judgeIsIgnore(target)
    ) {
      const bgColor = target.getAttribute('nav-origin-bg-color-trigger')
      target.style.backgroundColor = bgColor
      target.removeAttribute('nav-guide-hover-trigger')
    }
  }
  onClick = (e) => {
    const target = e.target
    if (!this.props.judgeIsIgnore(target)) {
      this.props.onSelTrigger(true)
      if (target.id) {
        this.props.form.setFieldsValue({
          triggerElement: '#' + target.id
        })
      } else {
        this.props.form.setFieldsValue({
          triggerElement: readXPath(target)
        })
      }
      document.removeEventListener('mousemove', this.onMousemove)
      document.removeEventListener('mouseout', this.onMouseout)
      document.removeEventListener('click', this.onClick, true)
      document.querySelector('.ant-modal-mask').style.display = 'block'
      document.querySelector('.ant-modal-wrap').style.display = 'block'
      const bgColor = target.getAttribute('nav-origin-bg-color-trigger')
      target.style.backgroundColor = bgColor
      target.removeAttribute('nav-guide-hover-trigger')
      e.stopPropagation()
    }
  }
  onSubmit = () => {
    this.props.form.validateFields((res) => {
      if (!res) {
        const desc = this.props.form.getFieldValue('desc')
        const interactive = this.props.form.getFieldValue('interactive')
        const triggerElement = this.props.form.getFieldValue('triggerElement')
        this.props.onUpdate({
          index: this.props.index,
          desc,
          interactive,
          triggerElement
        })
        message.success(this.props.intl.formatMessage(Lang.updateSuccess))
      }
    })
  }
  onDel =() => {
    this.props.onDel(this.props.currentItem)
  }
  getTitle = () => {
    if (this.props.currentItem.target.id) {
      return ''
    }
    return (
      <Notes type="warning" text={this.props.intl.formatMessage(Lang.warningText)} />
    )
  }
  handleCancel = () => {
    this.props.onClose()
  }
  afterClose = () => {
    if (document.querySelector('.ant-drawer')) {
      document.body.style.overflow = 'hidden'
    }
  }
  render() {
    const {
      currentItem,
      intl: {
        formatMessage
      },
      form: {
        getFieldDecorator
      }
    } = this.props

    if (!currentItem) {
      return null
    }

    const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 19
      }
    }
    const content = () => {
      let title
      let value
      if (currentItem.target.id) {
        title = this.props.intl.formatMessage(Lang.id)
        value = currentItem.target.id
      } else {
        title = this.props.intl.formatMessage(Lang.xpath)
        value = readXPath(currentItem.target)
      }
      const modalTitle = this.getTitle()
      return (
        <>
          {
            modalTitle && (
            <p className="nav-guide-modal-title">{modalTitle}</p>
            )
          }
          <Form
            data-bizdes="nav guide form"
          >
            <Form.Item {...formItemLayout} label={<Form.Label title={formatMessage(Lang.step)}>{formatMessage(Lang.step)}</Form.Label>}>
              {this.props.index + 1}
            </Form.Item>
            <Form.Item {...formItemLayout} label={<Form.Label title={title}>{title}</Form.Label>}>
              <div style={{ 'wordBreak': 'break-all' }}>
                {value}
              </div>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label={<Form.Label title={formatMessage(Lang.interType)}>{formatMessage(Lang.interType)}</Form.Label>}
            >
              {getFieldDecorator('interactive', {
              initialValue: this.props.currentItem.interactive
            })(
              <Radio.Group>
                <Radio value={0} data-bizdes="nav-guide-radio">{formatMessage(Lang.automatic)}</Radio>
                <Radio value={1} data-bizdes="nav-guide-radio">{formatMessage(Lang.manual)}</Radio>
              </Radio.Group>
              )}
            </Form.Item>
            {
            this.props.form.getFieldValue('interactive') === 1 && (
              <Form.Item
                {...formItemLayout}
                label={<Form.Label title={formatMessage(Lang.triggerEle)}>{formatMessage(Lang.triggerEle)}</Form.Label>}
              >
                {getFieldDecorator('triggerElement', {
                  initialValue: this.props.currentItem.triggerElement,
                  rules: [
                    { required: true, message: formatMessage(Lang.triggerEleVal) }
                  ]
                })(
                  <Input
                    disabled
                    style={{ width: 300 }}
                    data-bizdes="nav guide input"
                  />
              )}
                <Button
                  color="primary"
                  className="nav-guide-trigger-btn"
                  data-bizdes="nav-guid-trigger-hidden"
                  onClick={this.onSelTrigger}
                >
                  {formatMessage(Lang.selTrigger)}
                </Button>
              </Form.Item>
            )
          }
            <Form.Item
              {...formItemLayout}
              label={<Form.Label title={formatMessage(Lang.desc)}>{formatMessage(Lang.desc)}</Form.Label>}
            >
              {getFieldDecorator('desc', {
              initialValue: this.props.currentItem.desc
            })(
              <Input.TextArea
                style={{ minHeight: 150, width: '100%' }}
                data-bizdes="nav guide textarea"
              />
              )}
            </Form.Item>
          </Form>
        </>
      )
    }
    return (
      <Modal
        className="nav-guide-modal"
        data-bizdes="nav-guide-modal"
        visible={this.props.visible}
        afterClose={this.afterClose}
        footer={[
          <Popconfirm
            data-bizdes="nav guide popconfirm"
            title={formatMessage(Lang.popconfirmTitle)}
            onConfirm={this.onDel}
            okText={formatMessage(Lang.popconfirmOkText)}
            cancelText={formatMessage(Lang.popconfirmCancelText)}
          >
            <Button
              data-bizdes="nav guide del btn"
              key="del"
              color="warning"
            >
              {formatMessage(Lang.del)}
            </Button>
          </Popconfirm>,
          <Button
            data-bizdes="nav guide submit btn"
            key="submit"
            type="primary"
            onClick={this.onSubmit}
          >
            {formatMessage(Lang.submit)}
          </Button>
        ]}
        onCancel={this.handleCancel}
      >
        {content()}
      </Modal>
    )
  }
}

export default Form.create({
  name: 'nav-highlight-box'
})(injectIntl(HighlightBox))
