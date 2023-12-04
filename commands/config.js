const Discord = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const config = new JsonDatabase({ databasePath:"./config.json" });
const perms = new JsonDatabase({ databasePath:"./databases/myJsonPerms.json" });
const db = new JsonDatabase({ databasePath:"./databases/myJsonProdutos.json" });

module.exports = {
    name: "config", 
    run: async(client, message, args) => {
        if(message.author.id !== `${perms.get(`${message.author.id}_id`)}`) return message.reply(`❌ | Você não está na lista de pessoas!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
        if(!args[0]) return message.reply(`❌ | Você não selecionou nenhum ID!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
        if(args[1]) return message.reply(`❌ | Você não pode selecionar dois IDs de uma vez!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
        if(args[0] !== `${db.get(`${args[0]}.idproduto`)}`) return message.reply(`❌ | Esse ID de produto não é existente!`).then(msg => setTimeout(() => msg.delete().catch(err => console.log(err)), 5000));
        
        const adb = args[0];
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('descgerenciar')
                    .setEmoji('⚙️')
                    .setLabel('Descrição')
                    .setStyle('SUCCESS'),
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('nomegerenciar')
                    .setEmoji('⚙️')
                    .setLabel('Nome')
                    .setStyle('SUCCESS'),
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('precogerenciar')
                    .setEmoji('⚙️')
                    .setLabel('Preço')
                    .setStyle('SUCCESS'),
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('deletegerenciar')
                    .setEmoji('⚙️')
                    .setLabel('Excluir')
                    .setStyle('DANGER'),
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('rlgerenciar')
                    .setEmoji('⚙️')
                    .setLabel('Atualizar')
                    .setStyle('PRIMARY'),
            );
        
        const msg = await message.reply({ embeds: [new Discord.MessageEmbed()
            .setTitle(`${config.get(`title`)} | Configurando o(a) ${adb}`)
            .setDescription(`
\`\`\` ${db.get(`${adb}.desc`)}\`\`\`
<a:emojiplaneta:1078036508872806460>・Nome: ${db.get(`${adb}.nome`)}
<:emojidinheiro:1074528106729177188>・Preço: R$${db.get(`${adb}.preco`)}
<:emojicaixa:1074528103768010822>・Estoque: ${db.get(`${adb}.conta`).length}`)
.setImage('https://cdn.discordapp.com/attachments/1080242248983269386/1080242361520619641/1672200964185.png')
            .setColor(config.get(`color`))], components: [row]})
        
            const interação = msg.createMessageComponentCollector({
               componentType: "BUTTON",
            })
  
            interação.on("collect", async (interaction) => {
               if (message.author.id != interaction.user.id) {
               return;
            }
                
                if (interaction.customId === "deletegerenciar") {
                    msg.delete()
                    msg.channel.send("✅ | Excluido!")
                    db.delete(adb)
                }
                if (interaction.customId === "precogerenciar") {
                   interaction.deferUpdate();
                    msg.channel.send("❓ | Qual o novo preço?").then(msg => {
                        const filter = m => m.author.id === interaction.user.id;
                        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                        collector.on("collect", message => {
                            message.delete()
                            db.set(`${adb}.preco`, `${message.content.replace(",", ".")}`)
                            msg.edit("✅ | Alterado!")
                        })
                    })
                }
                if (interaction.customId === "nomegerenciar") {
        interaction.deferUpdate();
                    msg.channel.send("❓ | Qual o novo nome?").then(msg => {
                        const filter = m => m.author.id === interaction.user.id;
                        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                        collector.on("collect", message => {
                            message.delete()
                            db.set(`${adb}.nome`, `${message.content}`)
                            msg.edit("✅ | Alterado!")
                        })
                    })
                }
    if (interaction.customId === 'descgerenciar') {
        interaction.deferUpdate();
                    msg.channel.send("❓ | Qual a nova descrição?").then(msg => {
                        const filter = m => m.author.id === interaction.user.id;
                        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                        collector.on("collect", message => {
                            message.delete()
                            db.set(`${adb}.desc`, `${message.content}`)
                            msg.edit("✅ | Alterado!")
                        })
                    })
                }
    if (interaction.customId === 'rlgerenciar') {
        interaction.deferUpdate();
         const embed = new Discord.MessageEmbed()
           .setTitle(`${config.get(`title`)} | Configurando o(a) ${adb}`)
           .setDescription(`
           \`\`\` ${db.get(`${adb}.desc`)}\`\`\`
           <a:emojiplaneta:1078036508872806460>・Nome: ${db.get(`${adb}.nome`)}
           <:emojidinheiro:1074528106729177188>・Preço: R$${db.get(`${adb}.preco`)}
           <:emojicaixa:1074528103768010822>・Estoque: ${db.get(`${adb}.conta`).length}`)
           .setImage('https://cdn.discordapp.com/attachments/1080242248983269386/1080242361520619641/1672200964185.png')
           .setColor(config.get(`color`))
           msg.edit({ embeds: [embed] })
           message.channel.send("✅ | Atualizado!")
                }
              })
            }
           }