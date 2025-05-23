const connection = require('../../services/connection')

module.exports = async function getUserById( req, res){
    const sql = 'SELECT id, name, email, nic, contact_number FROM homebuild.users where email =?;'

    connection.query(sql, req.params.id, (err, result)=>{
        if(err){
            console.log(err)
            return res.status(500).send('error getting user data')
        }

        return res.status(200).send(result)
    })
}