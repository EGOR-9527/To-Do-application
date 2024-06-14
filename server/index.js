const express = require('express')
const cors = require('cors')
const Pool = require('pg').Pool
const PORT = 5000

//подключаем базу
const pool = new Pool({
    user: 'postgres',
    password: 'IT1000',
    host: 'localhost',
    port: 5432,
    database: 'to-do-aplication',
})

//проверяем подключение
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err);
    } else {
        console.log('Успешное подключение к базе данных');
    }
})

//создаем приложене
const app = express()

app.use(cors())
app.use(express.json())

//отпровляем в базу даду,задачу и статус
app.post('/todos', async (req, res) => {
    try {
        const { date, task, done } = req.body;
        const newTodo = await pool.query(
            "INSERT INTO todo (date, task, done) VALUES ($1, $2, $3) RETURNING *",
            [date, task, done]
        );

        res.json(newTodo.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("An error occurred while adding a new todo.");
    }
});

app.get('/todos', async (req, res) => {
    try {
        const todos = await pool.query("SELECT * FROM todo");
        res.json(todos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("An error occurred while fetching todos.");
    }
});

//получение данных
app.get('/todos/:id', async(req, res) => {
    try{
        const {id} = req.params
        const todos = await pool.query("SELECT * FROM todo WHERE todo_id = $1",[
            id
        ])
        res.json(todos.rows[0])
    }catch(err){
        console.error(err.message);
    }
})

//обновление данных

app.put('/todos/:id', async(req, res) => {
    try {
        const { id } = req.params
        const { date, task,done } = req.body
        const updateTodo = await pool.query(
            "UPDATE todo SET date = $1, task = $2, done = $3 WHERE todo_id = $4 RETURNING *",
            [date, task,done, id]
        )
        res.json(updateTodo.rows[0])
    } catch (err) {
        console.log(err.message)
        res.status(500).send("An error occurred while updating a todo.")
    }
})

//удаление данных

app.delete('/todos/:id', async(req, res) => {
    try {
        const { id } = req.params
        const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [
            id
        ])
        res.json("Todo was deleted")
    } catch (err) {
        console.log(err.message)
        res.status(500).send("An error occurred while deleting a todo.")
    }
})




//запкскаем приложение если есть ошибка выводим ее
const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
