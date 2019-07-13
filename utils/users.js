const users = [];

// add user
const addUser = ({ id, username, room}) =>{
    // Clear the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validation

    if(!username || !room ){
        return {
            error: 'Username and room required!'
        }
    }

    // Available users

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate user name 
    if(existingUser){
        return {
            error:'Username already taken'
        }
    }

    // store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

addUser({
    id:23,
    username: 'Max',
    room: 'New York'
})
const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}


const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

const getUser = (id) => {
    return users.find((user) => user.id === id )
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

    