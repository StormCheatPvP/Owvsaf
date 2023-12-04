const Discord = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const config = new JsonDatabase({ databasePath:"./config.json" });
const perms = new JsonDatabase({ databasePath:"./databases/myJsonPerms.json" });

module.exports = {
    name: "configcanais", 
    run: async(client, message, args) => {
      if(message.author.id !== `${perms.get(`${message.author.id}_id`)}`) return message.reply(`❌ | Você não está na lista de pessoas!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('categoriaconfig')
            .setEmoji('🛒')
            .setLabel('Categoria Carrinho')
            .setStyle('SECONDARY'),
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('logsconfig')
            .setEmoji('🧾')
            .setLabel('Logs Vendas')
            .setStyle('SECONDARY'),
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('logs2config')
            .setEmoji('🧰')
            .setLabel('Logs Vendas Staff')
            .setStyle('SECONDARY'),
        );
        
        const embed = await message.reply({ embeds: [new Discord.MessageEmbed()
                  .setTitle(`${config.get(`title`)} | Configuração dos canais`)
                  .setDescription(`
🛒・Categoria Carrinho: <#${config.get(`category`)}>
🧾・Logs Vendas: <#${config.get(`logs`)}>
🧰・Logs Vendas Staff: <#${config.get(`logs_staff`)}>`)
                  .setColor(config.get(`color`))], components: [row]})
        const interação = embed.createMessageComponentCollector({ componentType: "BUTTON", });
         interação.on("collect", async (interaction) => {
          if (message.author.id != interaction.user.id) {
           return;
          }

          if (interaction.customId === "categoriaconfig") {
            interaction.deferUpdate();
            message.channel.send("❓ | Qual a nova de categoria dos carrinhos em id?").then(msg => {
             const filter = m => m.author.id === interaction.user.id;
             const collector = msg.channel.createMessageCollector({ filter, max: 1 });
              collector.on("collect", category => {
                category.delete()
                const newt = category.content
                config.set(`category`, newt)
                msg.edit("✅ | Alterado!")
                            
                const embednew = new Discord.MessageEmbed()
                  .setTitle(`${config.get(`title`)} | Configuração dos canais`)
                  .setDescription(`
🛒・Categoria Carrinho: <#${config.get(`category`)}>
🧾・Logs Vendas: <#${config.get(`logs`)}>
🧰・Logs Vendas Staff: <#${config.get(`logs_staff`)}>`)
                  .setColor(config.get(`color`))
                embed.edit({ embeds: [embednew] })
                })
              })
            }
           if (interaction.customId === "logsconfig") {
            interaction.deferUpdate();
            message.channel.send("❓ | Qual o novo canal de logs de vendas em id?").then(msg => {
             const filter = m => m.author.id === interaction.user.id;
             const collector = msg.channel.createMessageCollector({ filter, max: 1 });
              collector.on("collect", logs => {
                logs.delete()
                const newt = logs.content
                config.set(`logs`, newt)
                msg.edit("✅ | Alterado!")
                            
                const embednew = new Discord.MessageEmbed()
                  .setTitle(`${config.get(`title`)} | Configuração dos canais`)
                  .setDescription(`
🆔・Categoria: <#${config.get(`category`)}>
🧾・Logs: <#${config.get(`logs`)}>
🧰・Logs Staff: <#${config.get(`logs_staff`)}>`)
                  .setColor(config.get(`color`))
                embed.edit({ embeds: [embednew] })
                })
              })
            }
                      
          if (interaction.customId === "logs2config") {
            interaction.deferUpdate();
            message.channel.send("❓ | Qual o novo canal de logs de vendas staff em id?").then(msg => {
             const filter = m => m.author.id === interaction.user.id;
             const collector = msg.channel.createMessageCollector({ filter, max: 1 });
              collector.on("collect", logs_staff => {
                logs_staff.delete()
                const newt = logs_staff.content
                config.set(`logs_staff`, newt)
                msg.edit("✅ | Alterado!")
                            
                const embednew = new Discord.MessageEmbed()
                  .setTitle(`${config.get(`title`)} | Configuração dos canais`)
                  .setDescription(`
🛒・Categoria Carrinho: <#${config.get(`category`)}>
🧾・Logs Vendas: <#${config.get(`logs`)}>
🧰・Logs Vendas Staff: <#${config.get(`logs_staff`)}>`)
                  .setColor(config.get(`color`))
                embed.edit({ embeds: [embednew] })
                })
              })
            }
          })
        }
      };