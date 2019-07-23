'use strict'

const Antl = use('Antl')

class Store {
  get validateAll () {
    return true
  }

  get rules () {
    const userId = this.ctx.params.id

    return {
      email: `required|unique:users,email,id,${userId}`,
      password: 'confirmed'
    }
  }

  get messages () {
    return Antl.list('validation')
  }
}

module.exports = Store
