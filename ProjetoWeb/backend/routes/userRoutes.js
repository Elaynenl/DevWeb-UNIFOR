const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Criar usuário
router.post('/', [
    check('cpf').isLength({ min: 11, max: 11 }).withMessage('CPF inválido'),
    check('email').isEmail().withMessage('Email inválido'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nome, cpf, nascimento, email, senha } = req.body;

    try {
        const userExists = await User.findOne({ cpf });
        if (userExists) {
            return res.status(400).json({ message: 'Usuário já cadastrado' });
        }

        const user = new User({ nome, cpf, nascimento, email, senha });
        await user.save();
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Autenticar usuário
router.post('/login', async (req, res) => {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
        return res.status(400).json({ message: 'CPF e senha são obrigatórios' });
    }

    try {

        const user = await User.findOne({ cpf });
        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const isMatch = await user.matchPassword(senha);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta' });
        }

        res.json({ message: 'Login bem-sucedido' });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Listar usuários
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao obter usuários' });
    }
});


//Buscar usuário pelo ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
});

// Excluir usuário
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário removido com sucesso' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao remover usuário' });
    }
});

module.exports = router;
