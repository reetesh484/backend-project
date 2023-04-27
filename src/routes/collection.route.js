import { Router } from 'express'
import { getAllCollection, deleteCollection, updateCollection, createCollection } from '../controllers/collection.controller.js'
import { isLoggedIn, authorize } from "../middleware/auth.middleware.js"
import AuthRoles from '../utils/authRoles.js'


const router = Router()

//create a collection
router.post("/", isLoggedIn, authorize(AuthRoles.ADMIN), createCollection)

//update a single collection
router.put("/:id", isLoggedIn, authorize(AuthRoles.ADMIN), updateCollection)

//delete a single collection
router.delete("/:id", isLoggedIn, authorize(AuthRoles.ADMIN), deleteCollection)

//get all collection
router.get("/", isLoggedIn, getAllCollection)


export default router;