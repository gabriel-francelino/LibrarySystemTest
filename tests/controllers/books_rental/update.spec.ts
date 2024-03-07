import { UpdateBooksRentalController } from '../../../src/controllers/books_rental/update'
import { logger } from '../../mocks/logger'
import { booksRentalRepositoryMock } from '../../mocks/books_rental_repository'
import { BooksRental, NewBooksRental } from '../../../src/controllers/models'
import { fakerEN } from '@faker-js/faker'
import { Request, Response } from 'express'

describe('UpdateBooksRentalController', ()=> {

  function makeSut() {
    const controller = new UpdateBooksRentalController(logger, booksRentalRepositoryMock)
    
    const newBooksRentalMock: NewBooksRental = {
      book_id: fakerEN.string.uuid(),
      user_id: fakerEN.string.uuid(),
      rented_at: fakerEN.date.anytime(),
      rental_time: fakerEN.date.anytime(),
    }

    const booksRentalMock: BooksRental = {
      id: fakerEN.string.uuid(),
      ...newBooksRentalMock
    }

    const requestMock = { 
      body: newBooksRentalMock,
      params: { id: booksRentalMock.id } as any,
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
      controller, newBooksRentalMock, booksRentalMock, requestMock, responseMock
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update and return book rental if the book rental exist', async () => {
    const {controller, newBooksRentalMock, booksRentalMock, requestMock, responseMock} = makeSut()
    jest.spyOn(booksRentalRepositoryMock, 'getById').mockResolvedValueOnce(booksRentalMock)
    jest.spyOn(booksRentalRepositoryMock, 'update').mockResolvedValueOnce(booksRentalMock)

    const promise = controller.update(requestMock, responseMock)

    await expect(promise).resolves.not.toThrow()
    expect(booksRentalRepositoryMock.update).toHaveBeenCalledWith(booksRentalMock.id, newBooksRentalMock)
    expect(responseMock.statusCode).toEqual(200)
    
  })

  it('should return 404 statusCode and not update the book rental if there is no rental with the id provided', async () => {
    const {controller, newBooksRentalMock, booksRentalMock, requestMock, responseMock} = makeSut()
    jest.spyOn(booksRentalRepositoryMock, 'getById').mockResolvedValueOnce(undefined)
    jest.spyOn(booksRentalRepositoryMock, 'update')

    const promise = controller.update(requestMock, responseMock)

    await expect(promise).resolves.not.toThrow()
    expect(booksRentalRepositoryMock.getById).toHaveBeenCalledWith(booksRentalMock.id)
    expect(booksRentalRepositoryMock.update).not.toHaveBeenCalled()
    expect(responseMock.statusCode).toEqual(404)
  
  })

  it('should return 409 statusCode and not update the book rental if there is a rental with the same book id', async () => {
    const {controller, newBooksRentalMock, booksRentalMock, requestMock, responseMock} = makeSut()
    jest.spyOn(booksRentalRepositoryMock, 'getByBookId').mockResolvedValueOnce(booksRentalMock)
    jest.spyOn(booksRentalRepositoryMock, 'update')

    const promise = controller.update(requestMock, responseMock)

    await expect(promise).resolves.not.toThrow()
    expect(booksRentalRepositoryMock.getByBookId).toHaveBeenCalledWith(booksRentalMock.book_id)
    expect(booksRentalRepositoryMock.update).not.toHaveBeenCalled()
    expect(responseMock.statusCode).toEqual(409)
  
  })

  it('should return 500 if some error occur', async () => {
    const {controller, newBooksRentalMock, booksRentalMock, requestMock, responseMock} = makeSut()
    jest.spyOn(booksRentalRepositoryMock, 'getById').mockRejectedValueOnce(new Error('some error'))

    const promise = controller.update(requestMock, responseMock)

    await expect(promise).resolves.not.toThrow()
    expect(responseMock.statusCode).toEqual(500)
  })
})