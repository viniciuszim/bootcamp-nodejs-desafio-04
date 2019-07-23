'use strict'

const Antl = use('Antl')

const { rule } = use('Validator')

class User {
  get validateAll () {
    return true
  }

  get rules () {
    return {
      title: 'required',
      location: 'required',
      date_start: [rule('date_format', 'YYYY-MM-DD HH:mm:ss')],
      date_end: [rule('date_format', 'YYYY-MM-DD HH:mm:ss')]
    }
  }

  get messages () {
    return Antl.list('validation')
  }
}

module.exports = User
