import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

import User from '../models/user.js'

export const signin = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing email and/or password' })
    }
    try {
        const existingUser = await User.findOne({ email: email })

        if (!existingUser) return res.status(404).json({ success: false, message: "User don't exist" })

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordCorrect) return res.status(400).json({ success: false, message: "User don't exist" })

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'test', { expiresIn: "1h" })

        res.status(200).json({ success: true, result: existingUser, token })
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const signup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body
    if (!firstName || !lastName) return res.status(400).json({ message: 'Missing FirstName and/or LastName' })
    try {
        const existingUser = await User.findOne({ email: email })

        if (existingUser) return res.status(400).json({ message: "User already exist." })

        if (password !== confirmPassword) return res.status(400).json({ message: "Password don't match." })

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` })

        const token = jwt.sign({ email: result.email, id: result._id }, 'test', { expiresIn: "1h" })

        res.status(200).json({ result, token })
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' })
    }
}