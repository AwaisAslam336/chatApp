const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.body;
    //check
    if (!user_id) {
      res.status(400);
      throw new Error("user_id is Not Given");
    }
    //found a chat in chats docs where:
    //1->isGroupChat=false
    //2->loggedIn and asked user are both present
    //it suppose to find a chat with specific user
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: user_id } } },
      ],
    })
      //populate fields of that found chat
      .populate("users", "-password")
      .populate("latestMessage");
    //populate sub-field sender of field latestMessage
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    //if there is such one chat, send it in response
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      //otherwise create new one
      const data = {
        chatName: "sender",
        isGroupChat: false,
        users: [user_id, req.user._id],
      };
      const newChat = await Chat.create(data);
      //fetch and send data of newly created chat
      const chatData = await Chat.findOne({ _id: newChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(chatData);
    }
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    //search chats Doc and fetch chats where current user is existed
    await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      //populate those found chats' fields
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        //populate sub-field of sender in latestMessage field
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(result);
      });
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  try {
    //check
    if (!req.body.users || !req.body.chatName) {
      res.status(401);
      throw new Error("Please, Fill all the fields.");
    }
    //users data suppose to come in stringify form from frontend
    const users = JSON.parse(req.body.users);
    //check
    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users are required to form a group chat.");
    }
    //also add current loggedIn user to group
    users.push(req.user);
    //create chat group
    const newChat = await Chat.create({
      chatName: req.body.chatName,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });
    //fetch data of new chat group and send response
    const newChatData = await Chat.findOne({ _id: newChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(newChatData);
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    //check
    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});

const addUserInGroupChat = asyncHandler(async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    //check
    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});

const removeUserFromGroupChat = asyncHandler(async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    //check
    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addUserInGroupChat,
  removeUserFromGroupChat,
};
