import { Request, Response } from "express";
import { IBooksRentalRepository } from "../interfaces";
import { Logger } from "winston";
import { BooksRental, NewBooksRental } from "../models";

export class UpdateBooksRentalController {
  constructor(
    private readonly logger: Logger,
    private readonly booksRentalRepository: IBooksRentalRepository
  ) {}

  public async update(req: Request, res: Response): Promise<BooksRental> {
    try {
      const { id } = req.params
      const body: NewBooksRental = req.body
  
      const bookRental = await this.booksRentalRepository.getById(id)
  
      if(!bookRental) {
        res.status(404).json({ message: 'any book with the id provided was founded'})
        return
      }

      if (body.book_id && (body.book_id !== bookRental.book_id)) {
        const withTheSameBookId = await this.booksRentalRepository.getByBookId(body.book_id)

        if (withTheSameBookId) {
          res.status(409).json({ message: 'there is already a book rental with the same book id provided' })
          return
        }
      }
  
      const updatedBookRental = await this.booksRentalRepository.update(id, body)
      res.status(200).json(updatedBookRental)
      return
      
    } catch (err) {
      this.logger.error({message: 'error to update user', error: err})
      res.status(500).json({ message: 'something went wrong, try again latter!' })
      return
    }
  }
}