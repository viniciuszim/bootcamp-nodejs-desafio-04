'use strict'

const Kue = use('Kue')
const Event = use('App/Models/Event')
const Job = use('App/Jobs/ShareEventMail')

class ShareEventController {
  /**
   * Create/save a new event.
   * POST events
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  async share ({ request, response, params, auth }) {
    try {
      const event = await Event.findOrFail(params.events_id)
      const email = request.input('email')

      if (event.user_id !== auth.user.id) {
        return response.status(401).send({
          error: {
            message: 'Apenas o criador do evento pode compartilha-lo.'
          }
        })
      }

      Kue.dispatch(
        Job.key,
        { email, username: auth.user.username, event },
        { attempts: 3 }
      )
    } catch (error) {
      return response.status(404).send({
        error: {
          message: 'Evento não encontrado'
        }
      })
    }
  }
}

module.exports = ShareEventController
