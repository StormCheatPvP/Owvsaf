const Discord = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const db2 = new JsonDatabase({ databasePath:"./databases/myJsonDatabase.json" });
const config = new JsonDatabase({ databasePath:"./config.json" });
const perms = new JsonDatabase({ databasePath:"./databases/myJsonPerms.json" });

module.exports = {
    name: "status", 
    run: async(client, message, args) => {
      if(message.author.id !== `${perms.get(`${message.author.id}_id`)}`) return message.reply(`❌ | Você não está na lista de pessoas!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      const embed = new Discord.MessageEmbed()
        .setTitle(`${config.get(`title`)} | Status de vendas`)
        .addField(`📦・Produtos vendidos:`, `${db2.get("pedidostotal") || "0"} vendas realizadas.`)
        .addField(`💵・Dinheiro arrecadado:`, `R$ ${db2.get("gastostotal") || "0"} Reais`)
        .setColor(config.get(`color`))
      message.reply({embeds: [embed]})
    }
}