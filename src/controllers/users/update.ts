import { IUsersRepository } from "../interfaces";
import { Request, Response } from "express";
import { Logger } from "winston";

export class UpdateUsersController {
  constructor(
    private readonly logger: Logger,
    private readonly usersRepository: IUsersRepository
  ) {}

  public async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const body = req.body

    try {
      const user = this.usersRepository.getById(id)

      if(!user) {
        res.status(404).json({ message: 'not any user with the id provided was founded' })
        return
      }

      if(body.email && body.email !== (await user).email) {
        const withTheSameEmail = await this.usersRepository.getByEmail(body.email)
        if (withTheSameEmail) {
          res.status(409).json({ message: 'there is already a user with the same email provided' })
          return
        }
      }

      const updatedUser = await this.usersRepository.update(id, body)
      res.status(200).json(updatedUser)
      return
      
    } catch (err) {
      this.logger.error({message: 'error to update user', error: err})
      res.status(500).json({ message: 'something went wrong, try again latter!' })
      return
    }

  }
}