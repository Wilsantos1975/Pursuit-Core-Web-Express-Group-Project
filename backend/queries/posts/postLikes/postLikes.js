const db = require("./../../../db/db");
const {isPostExisting, sendError, newDate, sendDoesntExist, successReq} = require("./../posts");

const sendNoLikes = (res) => {
} // End of sendNoLikes

const isLikeExisting = async (likerId, postId) => {
    try {
        return await db.any("SELECT * FROM likes WHERE liker_id=$1 AND post_id=$2",[likerId, postId]);
    } catch (error) {
        console.log(error);
    }
} // End of isLikeExisting() function

const getLikes = async (req, res) => {
    try {
        let {postId} = req.params;
        if(isPostExisting(postId)) {
            let likes = await db.any("SELECT COUNT(*) AS likesForPost FROM likes WHERE post_id=$1", postId);
            if(likes.length) {
                successReq(res, likes, `retrieved likes for post ${postId}`);
            } else {
                sendNoLikes(res);
            }
        } else {
            sendDoesntExist("post", postId);
        }
    } catch(error) {
        sendError(res, error);
    }
} // End of getLikes() function

const addLike = async (req, res) => {
    try {
        let {postId} = req.params;
        let {likerId} = req.body;
        if(isPostExisting(postId)) {
            if(isLikeExisting(likerId, postId)) {
                res.json({
                    status: "error",
                    error: "The user has liked the post already"
                })
            } else {
                await db.none("INSERT INTO likes (liker_id, post_id) VALUES ($1, $2)", [likerId, postId]);
                let post = await db.one("SELECT * FROM posts WHERE id=$1", postId);
                successReq(res, post, "Added like");
            }
        } else {
            sendDoesntExist("post", postId);
        }
    } catch(error) {
        sendError(res, error);
    }
} // End of addLike() function

module.exports = {getLikes, addLike}