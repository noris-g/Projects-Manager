const router = require("express").Router();
const { getMessagesByConversation } = require("../controllers/message.controller");

router.get("/:id", getMessagesByConversation);

module.exports = router;
