import { UpdateUsersController } from '../../../src/controllers/users/update'
import { logger } from '../../mocks/logger'
import { usersRepositoryMock } from '../../mocks/users_repository'
import { User, NewUser } from '../../../src/controllers/models'
import { fakerEN } from '@faker-js/faker'
import { Request, Response } from 'express'

describe('UpdateUsersController', ()=> {
  function makeSut() {
    const controller = new UpdateUsersController(logger, usersRepositoryMock)
    
    const newUserMock: NewUser = {
      name: fakerEN.internet.userName(),
      email: fakerEN.internet.email()
    }

    const userMock: User = {
      id: fakerEN.string.uuid(),
      ...newUserMock
    }

    const requestMock = { 
      body: newUserMock,
      params: { id: userMock.id } as any
    } as Request

    const responseMock = {
      statusCode: 0,
      status: (status: number) => {
        responseMock.statusCode = status
        return {
          json: jest.fn(),
          send: jest.fn(),
        } as any
      },
    } as Response

    return {
      controller, newUserMock, userMock, requestMock, responseMock
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update and return user if the user was funded and if there is no other user with the same email', async () => {
    const {controller, newUserMock, userMock, requestMock, responseMock} = makeSut()
    jest.spyOn(usersRepositoryMock, 'getById').mockResolvedValueOnce(userMock)
    jest.spyOn(usersRepositoryMock, 'getByEmail').mockResolvedValueOnce(undefined)
    jest.spyOn(usersRepositoryMock, 'update').mockResolvedValueOnce(userMock)

    const promise = controller.update(requestMock, responseMock)

    await expect(promise).resolves.not.toThrow()
    expect(usersRepositoryMock.getById).toHaveBeenCalledWith(userMock.id)
    expect(usersRepositoryMock.update).toHaveBeenCalledWith(userMock.id, newUserMock)
    expect(responseMock.statusCode).toEqual(200)
  })

  it('should return 404 statusCode and not update the user if there is no user with the id provided', async () => {
    const {controller, newUserMock, userMock, requestMock, responseMock} = makeSut()
    jest.spyOn(usersRepositoryMock, 'getById').mockResolvedValueOnce(undefined)
    jest.spyOn(usersRepositoryMock, 'update')

    const promise = controller.update(requestMock, responseMock)

    await expect(promise).resolves.not.toThrow()
    expect(usersRepositoryMock.update).not.toHaveBeenCalled()
    expect(responseMock.statusCode).toEqual(404)
  })

  it.todo('should return 409 statusCode and not update the user if there is an user with the same email')

  it.todo('should return 500 if some error occur')
})