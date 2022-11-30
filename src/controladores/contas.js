let { banco, contas, ultimoID, saques, depositos, transferências } = require('../bancodedados'); 

const listarContas = async (req, res) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(400).json({ mensagem: 'A senha do banco é obrigatória!' });
    }

    try{
        if (senha_banco != banco.senha) {
            return res.status(400).json({ mensagem: 'A senha do banco informada é inválida!' });
        }
         
        return res.status(200).json(contas)
    } catch(e) {
        return res.status(500).json(e.message);
    }
  
}

const criarConta = async (req, res) => {
    const {
        nome, 
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    } = req.body;
    
    if (!nome || !email || !cpf || !data_nascimento || !telefone || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    try {     
        const contaExiste = contas.find(conta => {
                return conta.usuario.cpf === cpf || conta.usuario.email === email
        });
        
        if(contaExiste) {
            return res.status(400).json('Email ou cpf já cadastrado')
        }
        
        const novaConta = {
            numero: ultimoID++, 
            saldo: 0,
            usuario: {
                nome,
                cpf,
                data_nascimento,
                telefone,
                email,
                senha
            }
        };

        contas.push(novaConta);

        return res.status(201).send();
    } catch(e) {
        return res.status(500).json(e.message);
    }
}

const atualizarConta = async (req, res) => {
    const {
        nome, 
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    } = req.body;
    
    if (!nome || !email || !cpf || !data_nascimento || !telefone || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }
    const { numeroConta } = req.params;
    
    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numeroConta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' });
    }
    
    try {
               
        if (cpf != contaEncontrada.usuario.cpf) {
            const existeCPF = contas.find(conta => conta.usuario.cpf === cpf);
            
            if (existeCPF) {
                res.status(400).json({ mensagem: 'CPF já cadastrado!' });
            }
        }
        
        if (email != contaEncontrada.usuario.email) {
            const existeEmail = contas.find(conta => conta.usuario.email === email);
            
            if (existeEmail) {
                res.status(400).json({ mensagem: 'Email já cadastrado!' });
            }
        }

        contaEncontrada.usuario = {
            nome, 
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
               
        return res.status(203).send()
        
    } catch(e) {
        return res.status(500).json(e.message);
    }
}

const excluirConta = async (req, res) => {
    const { numeroConta } = req.params 
    
    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numeroConta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' });
    }

    if (contaEncontrada.saldo > 0) {
        return res.status(403).json({ mensagem: 'A conta só pode ser excluida se o saldo for 0!' })
    }

    try{
        contas = contas.filter(conta => Number(conta.numero) != Number(numeroConta));
                
        return res.status(204).send()
        
    } catch(e) {
        return res.status(500).json(e.message);
    }
}

const saldo = async (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.satus(400).json({ mensagem: 'O numero da contae a senha são obrigatórios' });
    }

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' });
    }

    if (contaEncontrada.usuario.senha != senha) {
        return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    return res.json({ saldo: contaEncontrada.saldo });
}

const extrato = async (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.satus(400).json({ mensagem: 'O numero da contae a senha são obrigatórios' });
    }

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' });
    }

    if (contaEncontrada.usuario.senha != senha) {
        return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const extratoDepositos = depositos.filter(deposito => Number(deposito.numero_conta) === Number(numero_conta));
    
    const extratoSaques = saques.filter(saque => Number(saque.numero_conta) === Number(numero_conta));
   
    const transferenciasEnviadas = transferencias.filter(transferencia => Number(transferencia.numero_conta_origem) === Number(numero_conta));

    const transferenciasRecebidas = transferencias.filter(transferencia => Number(transferencia.numero_conta_destino) === Number(numero_conta));

    return res.json({ 
        depositos: extratoDepositos,
        saques: extratoSaques,
        transferenciasEnviadas,
        transferenciasRecebidas
     });   
}

module.exports = {
     criarConta,
     listarContas,
     excluirConta,
     atualizarConta,
     saldo,
     extrato
}