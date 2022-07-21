import jwt from "jsonwebtoken"

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.json({ message: 'Access token not found' })

    try {
        const isCustomAuth = token.length < 500

        let decoded

        if (token && isCustomAuth) {
            decoded = jwt.verify(token, 'test')

            req.userId = decoded?.id
        } else {
            decoded = jwt.decode(token)
            req.userId = decoded?.sub
        }

        next()
    } catch (error) {
        console.log(error)
    }
}

export default auth