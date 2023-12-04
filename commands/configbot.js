const Discord = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const config = new JsonDatabase({ databasePath:"./config.json" });
const perms = new JsonDatabase({ databasePath:"./databases/myJsonPerms.json" });

module.exports = {
    name: "configbot", 
    run: async(client, message, args) => {
      if(message.author.id !== `${perms.get(`${message.author.id}_id`)}`) return message.reply(`❌ | Você não está na lista de pessoas!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
      const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('nomeconfig')
            .setEmoji('⚙️')
            .setLabel('Nome')
            .setStyle('SECONDARY'),
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('corconfig')
            .setEmoji('⚙️')
            .setLabel('Cor')
            .setStyle('SECONDARY'),
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('avatarconfig')
            .setEmoji('⚙️')
            .setLabel('Avatar')
            .setStyle('SECONDARY'),
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('cargoconfig')
            .setEmoji('⚙️')
            .setLabel('Cargo')
            .setStyle('SECONDARY'),
        );
        
        const embed = await message.reply({ embeds: [new Discord.MessageEmbed()
          .setTitle(`${config.get(`title`)} | Configuração do bot`)
          .setDescription(`
🤖 | Nome: **${config.get(`title`)}**
🎨 | Cor: ${config.get(`color`)}
🖼️ | Avatar: [Clique aqui](${config.get(`thumbnail`)})
🎄 | Cargo Cliente: <@&${config.get(`role`)}>`)
          .setColor(config.get(`color`))], components: [row]})
        const interação = embed.createMessageComponentCollector({ componentType: "BUTTON", });
          interação.on("collect", async (interaction) => {
           if (message.author.id != interaction.user.id) {
             return;
           }

           if (interaction.customId === "nomeconfig") {
             interaction.deferUpdate();
             message.channel.send("❓ | Qual o novo nome?").then(msg => {
              const filter = m => m.author.id === interaction.user.id;
              const collector = msg.channel.createMessageCollector({ filter, max: 1 });
               collector.on("collect", title => {
                 title.delete()
                 client.user.setUsername(title.content);
                 const newt = title.content
                 config.set(`title`, newt)
                 msg.edit("✅ | Alterado!")
                            
                 const embednew = new Discord.MessageEmbed()
                   .setTitle(`${config.get(`title`)} | Configuração do bot`)
                   .setDescription(`
🤖 | Nome: **${config.get(`title`)}**
🎨 | Cor: ${config.get(`color`)}
🖼️ | Avatar: [Clique aqui](${config.get(`thumbnail`)})
🎄 | Cargo Cliente: <@&${config.get(`role`)}>`)
                   .setColor(config.get(`color`))
                 embed.edit({ embeds: [embednew] })
                 })
               })
             }
           if (interaction.customId === "corconfig") {
             interaction.deferUpdate();
             message.channel.send("❓ | Qual a nova cor em hex?").then(msg => {
              const filter = m => m.author.id === interaction.user.id;
              const collector = msg.channel.createMessageCollector({ filter, max: 1 });
               collector.on("collect", color => {
                 color.delete()
                 const newt = color.content
                 config.set(`color`, newt)
                 msg.edit("✅ | Alterado!")
                            
                 const embednew = new Discord.MessageEmbed()
                   .setTitle(`${config.get(`title`)} | Configuração do bot`)
                   .setDescription(`
🤖 | Nome: **${config.get(`title`)}**
🎨 | Cor: ${config.get(`color`)}
🖼️ | Avatar: [Clique aqui](${config.get(`thumbnail`)})
🎄 | Cargo Cliente: <@&${config.get(`role`)}>`)
                   .setColor(config.get(`color`))
                 embed.edit({ embeds: [embednew] })
                 })
               })
             }
           if (interaction.customId === "avatarconfig") {
             interaction.deferUpdate();
             message.channel.send("❓ | Qual o novo avatar do bot?").then(msg => {
              const filter = m => m.author.id === interaction.user.id;
              const collector = msg.channel.createMessageCollector({ filter, max: 1 });
               collector.on("collect", thumbnail => {
                 thumbnail.delete()
                 thumbnail.attachments.forEach(attachment => {
                 const newt = attachment.proxyURL;
                 client.user.setAvatar(newt);
                 config.set(`thumbnail`, newt)});
                 msg.edit("✅ | Alterado!")
                            
                 const embednew = new Discord.MessageEmbed()
                   .setTitle(`${config.get(`title`)} | Configuração do bot`)
                   .setDescription(`
🤖 | Nome: **${config.get(`title`)}**
🎨 | Cor: ${config.get(`color`)}
🖼️ | Avatar: [Clique aqui](${config.get(`thumbnail`)})
🎄 | Cargo Cliente: <@&${config.get(`role`)}>`)
                   .setColor(config.get(`color`))
                 embed.edit({ embeds: [embednew] })
                 })
               })
             }
           if (interaction.customId === "cargoconfig") {
             interaction.deferUpdate();
             message.channel.send("❓ | Qual o novo cargo em id?").then(msg => {
              const filter = m => m.author.id === interaction.user.id;
              const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                collector.on("collect", role => {
                 role.delete()
                 const newt = role.content
                 config.set(`role`, newt)
                 msg.edit("✅ | Alterado!")
                            
                 const embednew = new Discord.MessageEmbed()
                   .setTitle(`${config.get(`title`)} | Configuração do bot`)
                   .setDescription(`
🤖 | Nome: **${config.get(`title`)}**
🎨 | Cor: ${config.get(`color`)}
🖼️ | Avatar: [Clique aqui](${config.get(`thumbnail`)})
🎄 | Cargo Cliente: <@&${config.get(`role`)}>`)
                   .setColor(config.get(`color`))
                 embed.edit({ embeds: [embednew] })
                 })
               })
             }
           })
         }
       };