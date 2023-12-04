const Discord = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const perms = new JsonDatabase({ databasePath:"./databases/myJsonPerms.json" });
const config = new JsonDatabase({ databasePath:"./config.json" });

module.exports = {
    name: "permadd",
    run: async(client, message, args) => {
      const user = args[0]
      if (message.author.id !== config.get(`owner`)) return message.reply(`✅ | Apenas o dono do bot pode usar isso!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      if (!args[0]) return message.reply(`✅ | Você não selecionou ninguem!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      if(args[1]) return message.reply(`✅ | Você não pode selecionar duas pessoas de vez!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      if(user === `${perms.get(`${user}_id`)}`) return message.reply(`✅ | Essa pessoa já tem permissão!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      if(isNaN(args)) return message.reply(`✅ | Você só pode adicionar IDs!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
        
      message.reply(`✅ | Usuário adicionado!`)
      perms.set(`${user}_id`, user)
    }
}