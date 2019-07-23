'use strict'
// adonis serve --dev

const Route = use('Route')

// Files
Route.get('files/:id', 'FileController.show')

// Sessions
Route.post('sessions', 'SessionController.store').validator('Session')

// Users
Route.post('users', 'UserController.store').validator('User/Store')

// Users Passwords
Route.post('users/passwords', 'ForgotPasswordController.store').validator(
  'ForgotPassword'
)
Route.put('users/passwords', 'ForgotPasswordController.update').validator(
  'ResetPassword'
)

// Need to be authenticated
Route.group(() => {
  // Files
  Route.post('files', 'FileController.store')

  // Events
  Route.resource('events', 'EventController')
    .apiOnly()
    .validator(
      new Map([
        [['events.store'], ['Event/Store']],
        [['events.update'], ['Event/Update']]
      ])
    )
  Route.post('events/:events_id/share', 'ShareEventController.share').validator(
    'Event/Share'
  )

  // Users
  Route.put('users/:id', 'UserController.update').validator('User/Update')
}).middleware(['auth'])
