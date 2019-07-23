'use strict'

const Hash = use('Hash')
const User = use('App/Models/User')

class UserController {
  async store ({ request }) {
    const data = request.only(['name', 'email', 'password'])

    const user = await User.create(data)

    return user
  }

  async update ({ request, response, auth: { user } }) {
    const data = request.only(['password', 'password_old', 'name'])

    if (data.password_old) {
      const isSame = await Hash.verify(data.password_old, user.password)

      if (!isSame) {
        return response.status(401).send({
          error: {
            message: 'A senha antiga não é válida'
          }
        })
      }

      if (!data.password) {
        return response.status(401).send({
          error: {
            message: 'Você não informou a nova senha'
          }
        })
      }

      delete data.password_old
    }

    if (!data.password) {
      delete data.password
    }

    user.merge(data)

    await user.save()

    return user
  }
}

module.exports = UserController
