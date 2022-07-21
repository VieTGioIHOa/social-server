import mongoose from "mongoose"
import PostMessage from "../models/postMessage.js"

export const getPostsBySearch = async (req, res) => {
    const { search, page } = req.query
    const limit = 4
    const skip = (Number(page) - 1) * limit
    try {
        const title = new RegExp(search, 'i')

        const posts = await PostMessage.find({ title }).sort('-createdAt').limit(limit).skip(skip)

        res.status(200).json({ posts, pageCount: Math.ceil(posts.length / limit) })
    } catch (error) {
        console.log(error)
    }
}

export const getPosts = async (req, res) => {
    const { page } = req.query
    const limit = 4
    const skip = (Number(page) - 1) * limit
    try {
        const total = await PostMessage.countDocuments({})

        const posts = await PostMessage.find().sort('-createdAt').limit(limit).skip(skip)

        res.status(200).json({ posts, currentPage: Number(page), pageCount: Math.ceil(total / limit) })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}


export const getPost = async (req, res) => {
    const { id } = req.params

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')

        const post = await PostMessage.findById(id)
        res.status(200).json(post)

    } catch (error) {
        console.log(error)
    }
}

export const createPost = async (req, res) => {
    const post = req.body
    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() })
    try {
        await newPost.save()

        const total = await PostMessage.countDocuments({})

        res.status(200).json({ newPost, pageCount: Math.ceil(total / 4) })
    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params
    const post = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')

    const updatePost = await PostMessage.findByIdAndUpdate(id, post, { new: true })
    res.json(updatePost)
}

export const deletePost = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')

    const deletedPost = await PostMessage.findByIdAndRemove(id)
    const total = await PostMessage.countDocuments({})

    res.json({ post: deletedPost, pageCount: Math.ceil(total / 4) })
}

export const likePost = async (req, res) => {
    const { id } = req.params

    if (!req.userId) return res.json({ message: 'Unauthenticated' })
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')

    const post = await PostMessage.findById(id)

    const index = post.likes.findIndex(id => id === String(req.userId))

    if (index === -1) {
        post.likes.push(req.userId)
    } else {
        post.likes = post.likes.filter(id => id !== String(req.userId))
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })

    res.json(updatedPost)
}


export const commentPost = async (req, res) => {
    const { id } = req.params
    const { value } = req.body

    const post = await PostMessage.findById(id)

    post.comments.push(value)

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })

    res.json(updatedPost)

}