let { contas, saques, depositos, transferencias } = require('../bancodedados');
const { format } = require('date-fns');

const depositar = async (req, res) => {
    const { numero_conta, valor } = req.body
    
    if (!numero_conta || !valor) {
        return res.satus(400).json({ mensagem: 'O numero da conta e o valor são obrigatórios' });
    }

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json( { mensagem: 'Conta não encontrada' });
    }
    
    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor não pode ser menor ou igual a 0' });
    }

    try{
        contaEncontrada.saldo += valor;
 
        const registro = {
            data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            numero_conta,
            valor,
        }

        depositos.push(registro);
        
        return res.status(201).send()
    
    }catch(e) {
        return res.status(500).json(e.message);
    }
    
}

const sacar = async (req, res) => {
    const { numero_conta, valor, senha } = req.body
    
    if (!numero_conta || !valor || !senha) {
        return res.satus(400).json({ mensagem: 'O numero da conta, o valor e a senha são obrigatórios' });
    }

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json( { mensagem: 'Conta não encontrada' });
    }
    
    if (!contaEncontrada.usuario.senha != senha) {
        return res.status(400).json( { mensagem: 'Senha inválida' });
    }
    
    if (contaEncontrada.saldo < valor) {
        return res.status(403).json({ mensagem: 'Saldo insuficiente' });
    }

    try{
        contaEncontrada.saldo -= valor;
 
        const registro = {
            data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            numero_conta,
            valor,
        }

        saques.push(registro);
        
        return res.status(201).send();
    
    }catch(e) {
        return res.status(500).json(e.message);
    }
    
}
    
const transferir = async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor,senha } = req.body;
        
    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.satus(400).json({ mensagem: 'O numero da conta de origem, o numero da conta de destino, o valor e a senha são obrigatórios' });
    }
     const contaEncontradaOrigem = contas.find(conta => Number(conta.numero) === Number(numero_conta_origem));

     if (!contaEncontradaOrigem) {
        return res.status(404).json({ mensagem: 'Conta de origem não encontrada' });
     }
     
     const contaEncontradaDestino = contas.find(conta => Number(conta.numero) === Number(numero_conta_destino));

     if (!contaEncontradaDestino) {
        return res.status(404).json({ mensagem: 'Conta de destino não encontrada' });
     }

     if (contaEncontradaOrigem.usuario.senha != senha) {
        return res.status(400).json({ mensagem: 'Senha inválida' });
     }

     if (contaEncontradaOrigem.saldo < valor) {
        return res.status(403).json({ mensagem: 'Saldo insuficiente' });
    }

    try {
        contaEncontradaOrigem.saldo -= valor;
        contaEncontradaDestino += valor;

        const registro = {
            data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            numero_conta_origem,
            numero_conta_destino,
            valor
        }

        transferencias.push(registro);
        
        return res.status(201).send();
    } catch (e) {
        return res.status(500).json(e.message);
    }
}

module.exports = {
    depositar,
    sacar,
    transferir
}