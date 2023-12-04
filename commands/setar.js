const Discord = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const config = new JsonDatabase({ databasePath:"./config.json" });
const perms = new JsonDatabase({ databasePath:"./databases/myJsonPerms.json" });
const db = new JsonDatabase({ databasePath:"./databases/myJsonProdutos.json" });

module.exports = {
    name: "setar", 
    run: async(client, message, args) => {
      if(message.author.id !== `${perms.get(`${message.author.id}_id`)}`) return message.reply(`❌ | Você não está na lista de pessoas!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      if (!args[0]) return message.reply(`❌ | Você não selecionou nenhum ID de produto!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      if(args[1]) return message.reply(`❌ | Você não selecionar dois IDs de vez!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      if(args[0] !== `${db.get(`${args[0]}.idproduto`)}`) return message.reply(`❌ | Esse ID de produto não é existente!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));

      const row = new Discord.MessageActionRow()               
        .addComponents(
          new Discord.MessageButton()
            .setCustomId(args[0])
            .setLabel('Comprar')
            .setEmoji("🛒")
            .setStyle('SUCCESS'),
      );
        
      const embed = new Discord.MessageEmbed()
        .setTitle(`${config.get(`title`)} | Store`)
        .setDescription(`
\`\`\`
${db.get(`${args[0]}.desc`)}
\`\`\`
**💎・Nome:**  ${db.get(`${args[0]}.nome`)} 
**💵・Preço:** R$ ${db.get(`${args[0]}.preco`)} 
**📦・Estoque:**  ${db.get(`${args[0]}.conta`).length} `)
        .setColor(config.get(`color`))
        .setImage('https://media.discordapp.net/attachments/1081018256170696747/1081025864025772102/standard_-_2023-03-02T223026.253.gif')
      message.channel.send({embeds: [embed], components: [row]})
    }
}