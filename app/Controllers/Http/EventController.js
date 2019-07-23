'use strict'

const moment = require('moment')

const Event = use('App/Models/Event')

/**
 * Resourceful controller for interacting with events
 */
class EventController {
  /**
   * Show a list of all events.
   * GET events
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, auth }) {
    const { date, page } = request.get()

    let query = Event.query().with('user')

    if (date) {
      query = query.whereRaw(`"date_start"::date >= ?`, date)
    }

    const events = await query.paginate(page)

    return events
  }

  /**
   * Create/save a new event.
   * POST events
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   */
  async store ({ request, response, auth }) {
    const data = request.only(['title', 'location', 'date_start', 'date_end'])

    let event = await Event.query()
      .where('date_start', data.date_start)
      .where('user_id', auth.user.id)
      .fetch()

    if (event.size() > 0) {
      return response.status(401).send({
        error: {
          message: 'Não é possível definir dois eventos no mesmo horário.'
        }
      })
    }

    event = await Event.create({ ...data, user_id: auth.user.id })
    return event
  }

  /**
   * Display a single event.
   * GET events/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, auth }) {
    try {
      const event = await Event.findOrFail(params.id)

      if (event.user_id !== auth.user.id) {
        return response.status(401).send({
          error: {
            message: 'Apenas o criador do evento pode vê-lo.'
          }
        })
      }

      return event
    } catch (error) {
      return response.status(404).send({
        error: {
          message: 'Evento não encontrado'
        }
      })
    }
  }

  /**
   * Update event details.
   * PUT or PATCH events/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, auth }) {
    try {
      const event = await Event.findOrFail(params.id)

      if (event.user_id !== auth.user.id) {
        return response.status(401).send({
          error: {
            message: 'Apenas o criador do evento pode edita-lo.'
          }
        })
      }

      const passed = moment().isAfter(event.date_start)

      if (passed) {
        return response.status(401).send({
          error: {
            message: 'Você não pode editar eventos passados.'
          }
        })
      }

      const data = request.only(['title', 'location', 'date_start', 'date_end'])

      let events = await Event.query()
        .where('date_start', data.date_start)
        .where('user_id', auth.user.id)
        .fetch()

      // if (events.size() > 0) {
      //   for (let index = 0; index < events.size(); index++) {
      //     const eventAux = events[index]
      //     if (eventAux.id !== event.id) {
      //       return response.status(401).send({
      //         error: {
      //           message: 'Não é possível definir dois eventos no mesmo horário.'
      //         }
      //       })
      //     }
      //   }
      // }

      event.merge(data)

      await event.save()

      return event
    } catch (error) {
      return response.status(404).send({
        error: {
          message: 'Evento não encontrado'
        }
      })
    }
  }

  /**
   * Delete a event with id.
   * DELETE events/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response, auth }) {
    try {
      const event = await Event.findOrFail(params.id)

      if (event.user_id !== auth.user.id) {
        return response.status(401).send({
          error: {
            message: 'Apenas o criador do evento pode excluí-lo.'
          }
        })
      }

      const passed = moment().isAfter(event.when)

      if (passed) {
        return response.status(401).send({
          error: {
            message: 'Você não pode excluir eventos passados.'
          }
        })
      }

      await event.delete()
    } catch (error) {
      return response.status(404).send({
        error: {
          message: 'Evento não encontrado'
        }
      })
    }
  }
}

module.exports = EventController
