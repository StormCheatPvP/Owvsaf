const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });
const mercadopago = require("mercadopago")
const axios = require("axios")
const moment = require("moment")
const { WebhookClient } = require("discord.js")

const { JsonDatabase, } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/myJsonProdutos.json" });
const dbc = new JsonDatabase({ databasePath: "./databases/myJsonCupons.json" });
const db2 = new JsonDatabase({ databasePath: "./databases/myJsonDatabase.json" });
const db3 = new JsonDatabase({ databasePath: "./databases/myJsonIDs.json" });
const perms = new JsonDatabase({ databasePath: "./databases/myJsonPerms.json" });
const config = new JsonDatabase({ databasePath: "./config.json" });

moment.locale("pt-br");
client.login(config.get(`token`));
client.on('ready', async () => {
    console.clear()
    const owner = client.users.cache.get(config.get('owner'))
    const messages = [`👻・Logando na conta ${client.user.username}`, "👻・Bot logado com sucesso.", "👻・Bot conectado a DataBase", "👻・Bot conectado a API", "👻・Bot conectado ao Discord", "👻・Sistema de vendas automáticas", `👻・Desenvolvido por ${owner.tag}`];

    const guilds = (await client.guilds.fetch()).map((guild) => { return guild.name });

    messages.push(`👻・Estou nos servidores ${guilds.join(', ')}`)

    var message_is = 0;

    const timer = setInterval(() => {
        if (message_is >= messages.length) return clearInterval(timer);

        message_is += 1;

        console.log(messages[message_is - 1]);
    }, 1000);
    client.user.setActivity(`${config.get(`status`)} `, { type: "STREAMING", url: "https://www.twitch.tv/pxtrem1" });
});

//Logs de ficar ON

process.on('unhandledRejection', (reason, p) => {
    console.log('❌ ・Algum erro detectado')
    console.log(reason, p)
});
process.on('multipleResolves', (type, promise, reason) => {
    console.log('❌ ・Vários erros encontrados')
    console.log(type, promise, reason)
});
process.on('uncaughtExceptionMonito', (err, origin) => {
    console.log('❌ ・Sistema bloqueado')
    console.log(err, origin)
    });
    process.on('uncaughtException', (err, origin) => {
        console.log('❌ ・Erro encontrado')
        console.log(err, origin)
    });

client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (message.channel.type == 'dm') return;
    if (!message.content.toLowerCase().startsWith(config.get(`prefix`).toLowerCase())) return;
    if (message.content.startsWith(`<@!${client.user.id}> `) || message.content.startsWith(` <@${client.user.id}> `)) return;
    const args = message.content
        .trim().slice(config.get(`prefix`).length)
        .split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        const commandFile = require(`./commands/${command}.js`)
        commandFile.run(client, message, args);
    } catch (err) {
        console.log(err)
        message.reply(`❌・Este comando não existe!`)
    }
});

client.on("interactionCreate", (interaction) => {
    if (interaction.isButton()) {
        const eprod = db.get(interaction.customId);
        if (!eprod) return;
        const severi = interaction.customId;
        if (eprod) {
            const quantidade = db.get(`${severi}.conta`).length;
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId(interaction.customId)
                        .setLabel('・Comprar')
                        .setEmoji("🛒")
                        .setStyle('SUCCESS'),
                );

            const embed = new Discord.MessageEmbed()
                .setTitle(`${config.get(`title`)}・Store`)
                .setDescription(`
    \`\`\`
${db.get(`${interaction.customId}.desc`)}
\`\`\`
**💎・Nome:**  ${db.get(`${interaction.customId}.nome`)} 
**💵・Preço:**  ${db.get(`${interaction.customId}.preco`)} 
**📦・Estoque:**  ${db.get(`${interaction.customId}.conta`).length} `)
                .setColor(config.get(`color`))
                .setImage(' ')
            interaction.message.edit({ embeds: [embed], components: [row] })

            if (quantidade < 1) {
                const embedsemstock = new Discord.MessageEmbed()
                    .setTitle(`${config.get(`title`)}・Sistema de Vendas`)
                    .setDescription(`❌・Este produto está sem estoque no momento, volte mais tarde!`)
                    .setColor(`#f54646`)
                interaction.reply({ embeds: [embedsemstock], ephemeral: true })
                return;
            }

            // interaction.deferUpdate()
            if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) {
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setColor('#76269e')
                            .setDescription(`❌・**VOCÊ JÁ POSSUI UM CARRINHO ABERTO.\nFINALIZE-O ANTES DE ABRIR OUTRO !**\n\nEq. Pxz Store・2023`)
                    ],
                    ephemeral: true
                })
            }


            interaction.guild.channels.create(`🛒・carrinho-${interaction.user.username}`, {
                type: "GUILD_TEXT",
                parent: config.get(`category`),
                topic: interaction.user.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                    },
                    {
                        id: interaction.user.id,
                        allow: ["VIEW_CHANNEL"],
                        deny: ["SEND_MESSAGES"]
                    },
                ]
            }).then(async (c) => {
                await interaction.reply({
                    content: `✅・Criando seu carrinho...`,
                    ephemeral: true
                })

                await setTimeout(() => {
                    interaction.editReply({
                        content: ` `,
                        embeds: [
                            new Discord.MessageEmbed()
                                .setTitle(`${config.get(`title`)}・Sistema de Vendas`)
                                .setColor('#2bf889')
                                .setDescription(`✅・${interaction.user} **Seu carrinho foi aberto com sucesso em: ${c}**`)
                        ],
                        components: [
                            new Discord.MessageActionRow()
                                .addComponents(
                                    new Discord.MessageButton()
                                        .setStyle('LINK')
                                        .setLabel('・Ir para carrinho')
                                        .setEmoji('<:carrinho:1041698763938471986>')
                                        .setURL(`https://discord.com/channels/${c.guildId}/${c.id}`)
                                )
                        ],
                        ephemeral: true
                    });
                }, 500);

                const msg_verify_dm = await c.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setColor('#ffffff')
                            .setDescription(`
                            ✅・*Antes de continuar sua compra, certifique-se que seu privado(a) está aberto para receber mensagens, pois logo após a compra caso não receba por estar com privado bloqueado não iremos nos responsabilizar!*`)
                    ], content: `<@${interaction.user.id}>`,
                    components: [
                        new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('verify_dm')
                                    .setLabel('Testar DM')
                                    .setEmoji('👤')
                                    .setStyle('PRIMARY'),
                                new Discord.MessageButton()
                                    .setCustomId('next_page')
                                    .setEmoji('✅')
                                    .setLabel('Continuar')
                                    .setStyle('SUCCESS')
                            )
                    ], fetchReply: true
                })

                const timer0 = setTimeout(function () {
                    if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                    db3.delete(`${data_id}`)
                    interaction.user.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setTitle(`${config.get(`title`)}・Compra Cancelada`)
                                .setColor('#f54646')
                                .setDescription(`Olá <@${interaction.user.id}>,\n\nSeu carrinho foi fechado por inatividade, caso isso tenha sido um erro entre em contato com a administração!`)
                        ]
                    })
                }, 600000);

                const filter = i => i.user.id === interaction.user.id;

                collectorVerifyDm = msg_verify_dm.createMessageComponentCollector({ filter });

                collectorVerifyDm.on("collect", async (interaVerifyDm) => {
                    if (interaVerifyDm.customId === 'verify_dm') {
                        clearInterval(timer0)
                        await interaVerifyDm.user.send({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setColor('#8af88d')
                                    .setTitle(`${interaVerifyDm.guild.name}・Sistema de segurança`)
                                    .setDescription(`📧・**Se você recebeu essa mensagem sua dm está aberta tranquilamente**`)
                            ],
                            components: [
                                new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setStyle('LINK')
                                            .setLabel('・Voltar para o carrinho')
                                            .setEmoji('🛒')
                                            .setURL(`https://discord.com/channels/${c.guildId}/${c.id}`)
                                    )
                            ]
                        })

                        interaVerifyDm.reply({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setColor('#8af88d')
                                    .setTitle(`${interaVerifyDm.guild.name}・Sistema de segurança`)
                                    .setDescription(`**Foi enviada uma mensagem em sua DM(Privado), caso você não recebeu provavelmente você está com a DM(privado) bloqueado. Para desbloquear sua DM(Privado) acesse o artigo oficial do discord para mais informações**`)
                            ],
                            components: [
                                new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setStyle('LINK')
                                            .setEmoji(`🔗`)
                                            .setLabel('Saiba mais')
                                            .setURL('https://discord.gg/t7HGW5HS4s')
                                    )
                            ],
                            ephemeral: true
                        })
                    }

                    if (interaVerifyDm.customId === 'next_page') {
                        clearInterval(timer0)
                        collectorVerifyDm.stop();

                        let quantidade1 = 1;
                        let precoalt = eprod.preco;
                        var data_id = Math.floor(Math.random() * 999999999999999);
                        db3.set(`${data_id}.id`, `${data_id}`)
                        db3.set(`${data_id}.status`, `Pendente (1)`)
                        db3.set(`${data_id}.userid`, `${interaction.user.id}`)
                        db3.set(`${data_id}.dataid`, `${moment().format('LLLL')}`)
                        db3.set(`${data_id}.nomeid`, `${eprod.nome}`)
                        db3.set(`${data_id}.qtdid`, `${quantidade1}`)
                        db3.set(`${data_id}.precoid`, `${precoalt}`)
                        db3.set(`${data_id}.entrid`, `Andamento`)
                        const timer2 = setTimeout(function () {
                            if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                            db3.delete(`${data_id}`)
                            interaction.user.send({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setTitle(`${config.get(`title`)}・Compra Cancelada`)
                                        .setColor('#f54646')
                                        .setDescription(`Olá <@${interaction.user.id}>,\n\nSeu carrinho foi fechado por inatividade, caso isso tenha sido um erro entre em contato com a administração!`)
                                ]
                            })
                        }, 600000);

                        const row = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('removeboton')
                                    .setLabel('')
                                    .setEmoji("➖")
                                    .setStyle('SECONDARY'),
                            )
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('comprarboton')
                                    .setLabel('Comprar')
                                    .setEmoji('✅')
                                    .setStyle('SUCCESS'),
                            )
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('addboton')
                                    .setLabel('')
                                    .setEmoji("➕")
                                    .setStyle('SECONDARY'),
                            )
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('cancelarbuy')
                                    .setLabel('Cancelar')
                                    .setEmoji('❌')
                                    .setStyle('DANGER'),
                            );

                        const embedss = new Discord.MessageEmbed()
                            .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                            .addField(`💎・Nome:`, `${eprod.nome}`)
                            .addField(`📦・Quantidade:`, `${quantidade1}`)
                            .addField(`💵・Valor`, `R$${precoalt}`)
                            .addField(`🆔・Id da compra`, `${data_id}`)
                            .setColor(config.get(`color`))
                            .setImage(' ')
                        interaVerifyDm.update({ embeds: [embedss], content: `<@${interaction.user.id}>`, components: [row], fetchReply: true }).then(msg => {
                            const filter = i => i.user.id === interaction.user.id;
                            const collector = msg.createMessageComponentCollector({ filter });
                            collector.on("collect", intera => {
                                intera.deferUpdate()
                                if (intera.customId === 'cancelarbuy') {
                                    clearInterval(timer2);
                                    const embedcancelar = new Discord.MessageEmbed()
                                        .setTitle(`${config.get(`title`)}・Compra Cancelada`)
                                        .setDescription(`❌・Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                                        .setColor(`#f54646`)
                                        .setImage(' ')
                                    interaction.user.send({ embeds: [embedcancelar] })
                                    db3.delete(`${data_id}`)
                                    if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                }
                                if (intera.customId === "addboton") {
                                    if (quantidade1++ >= quantidade) {
                                        quantidade1--;
                                        const embedss2 = new Discord.MessageEmbed()
                                            .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                            .addField(`💎・Nome:`, `${eprod.nome}`)
                                            .addField(`📦・Quantidade:`, `${quantidade1}`)
                                            .addField(`💵・Valor`, `R$${precoalt}`)
                                            .addField(`🆔・Id da compra`, `${data_id}`)
                                            .setColor(config.get(`color`))
                                            .setImage(' ')
                                        msg.edit({ embeds: [embedss2] })
                                    } else {
                                        precoalt = Number(precoalt) + Number(eprod.preco);
                                        const embedss = new Discord.MessageEmbed()
                                            .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                            .addField(`💎・Nome:`, `${eprod.nome}`)
                                            .addField(`📦・Quantidade:`, `${quantidade1}`)
                                            .addField(`💵・Valor`, `R$${precoalt}`)
                                            .addField(`🆔・Id da compra`, `${data_id}`)
                                            .setColor(config.get(`color`))
                                            .setImage(' ')
                                        msg.edit({ embeds: [embedss] })
                                    }
                                }
                                if (intera.customId === "removeboton") {
                                    if (quantidade1 <= 1) {
                                    } else {
                                        precoalt = precoalt - eprod.preco;
                                        quantidade1--;
                                        const embedss = new Discord.MessageEmbed()
                                            .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                            .addField(`💎・Nome:`, `${eprod.nome}`)
                                            .addField(`📦・Quantidade:`, `${quantidade1}`)
                                            .addField(`💵・Valor`, `R$${precoalt}`)
                                            .addField(`🆔・Id da compra`, `${data_id}`)
                                            .setColor(config.get(`color`))
                                            .setImage(' ')
                                        msg.edit({ embeds: [embedss] })
                                    }
                                }

                                if (intera.customId === "comprarboton") {
                                    msg.channel.bulkDelete(50);
                                    clearInterval(timer2);
                                    const timer3 = setTimeout(function () {
                                        if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                        db3.delete(`${data_id}`)
                                        interaction.user.send({
                                            embeds: [
                                                new Discord.MessageEmbed()
                                                    .setColor('#f54646')
                                                    .setDescription(`Seu carrinho foi fechado por inatividade, caso isso tenha sido um erro entre em contato com a administração!`)
                                            ]
                                        })
                                    }, 600000)
                                    const row = new Discord.MessageActionRow()
                                        .addComponents(
                                            new Discord.MessageButton()
                                                .setCustomId('addcboton')
                                                .setLabel('Cupom')
                                                .setEmoji('🎟️')
                                                .setStyle('PRIMARY'),
                                        )
                                        .addComponents(
                                            new Discord.MessageButton()
                                                .setCustomId('continuarboton')
                                                .setLabel('Continuar')
                                                .setEmoji('✅')
                                                .setStyle('SUCCESS'),
                                        )
                                        .addComponents(
                                            new Discord.MessageButton()
                                                .setCustomId('cancelarboton')
                                                .setLabel('Cancelar')
                                                .setEmoji('❌')
                                                .setStyle('DANGER'),
                                        );



                                    const embedss = new Discord.MessageEmbed()
                                        .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                        .addField(`💎・Produto:`, `${eprod.nome}`)
                                        .addField(`📦・Quantidade:`, `${quantidade1}`)
                                        .addField(`💵・Total:`, `${precoalt}`)
                                        .addField(`🎟️・Cupom:`, `Nenhum`)
                                        .addField(`🎉・Desconto:`, `0.00%`)
                                        .addField(`💵・Preço Atual:`, `${precoalt}`)
                                        .addField(`🆔・Id da compra:`, `${data_id}`)
                                        .setColor(config.get(`color`))
                                        .setImage(' ')
                                    c.send({ embeds: [embedss], components: [row], content: `<@${interaction.user.id}>`, fetchReply: true }).then(msg => {
                                        var precinho = 0;
                                        var descontinho = "0";
                                        var cupomfinal = 0;
                                        var cupom = {};

                                        const filter = i => i.user.id === interaction.user.id;
                                        const collector = msg.createMessageComponentCollector({ filter });
                                        collector.on("collect", intera2 => {
                                            intera2.deferUpdate()



                                            if (intera2.customId === 'addcboton') {
                                                row.components[0].setDisabled(true)
                                                msg.edit({ embeds: [embedss], components: [row], content: `<@${interaction.user.id}> `, fetchReply: true })
                                                intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: true });
                                                msg.channel.send("🎟️・Adicione o cupom :").then(mensagem => {
                                                    const filter = m => m.author.id === interaction.user.id;
                                                    const collector = mensagem.channel.createMessageCollector({ filter, max: 1 });
                                                    collector.on("collect", cupomInteraction => {
                                                        cupom = cupomInteraction;

                                                        if (`${cupom}` !== `${dbc.get(`${cupom}.idcupom`)}`) {
                                                            row.components[0].setDisabled(false)
                                                            msg.edit({ embeds: [embedss], components: [row], content: `<@${interaction.user.id}> `, fetchReply: true })
                                                            cupom.delete()
                                                            mensagem.edit("❌・Isso não é um cupom!").then((msg) => { setTimeout(() => { msg.delete() }, 1000); })
                                                            intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                                            return;
                                                        }

                                                        var minalt = dbc.get(`${cupom}.minimo`);
                                                        var dscalt = dbc.get(`${cupom}.desconto`);
                                                        var qtdalt = dbc.get(`${cupom}.quantidade`);

                                                        precoalt = Number(precoalt) + Number(`1`);
                                                        minalt = Number(minalt) + Number(`1`);
                                                        if (precoalt < minalt) {
                                                            row.components[0].setDisabled(false)
                                                            msg.edit({ embeds: [embedss], components: [row], content: `<@${interaction.user.id}> `, fetchReply: true })
                                                            cupom.delete()
                                                            intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                                            mensagem.edit(`❌・Você não atingiu o mínimo!`).then((msg) => { setTimeout(() => { msg.delete() }, 1000); })

                                                            return;
                                                        } else {

                                                            precoalt = Number(precoalt) - Number(`1`);
                                                            minalt = Number(minalt) - Number(`1`);

                                                            if (`${dbc.get(`${cupom}.quantidade`)}` === "0") {
                                                                row.components[0].setDisabled(false)
                                                                msg.edit({ embeds: [embedss], components: [row], content: `<@${interaction.user.id}> `, fetchReply: true })
                                                                cupom.delete()
                                                                intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                                                mensagem.edit("❌・Esse cupom saiu de estoque!").then((msg) => { setTimeout(() => { msg.delete() }, 1000); })
                                                                return;
                                                            }

                                                            if (`${cupom}` === `${dbc.get(`${cupom}.idcupom`)}`) {
                                                                cupom.delete()
                                                                mensagem.edit("✅・Cupom adicionado").then((msg) => { setTimeout(() => { msg.delete() }, 1000); })
                                                                intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                                                precinho = precoalt;
                                                                descontinho = "0." + dscalt;
                                                                cupomfinal = precinho * descontinho;
                                                                precoalt = precinho - cupomfinal;
                                                                qtdalt = qtdalt - 1;
                                                                row.components[0].setDisabled(true)
                                                                cupomFinish = dbc.get(`${cupom}`)
                                                                const embedss2 = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                                                    .addField(`💎・Produto:`, `${eprod.nome}`)
                                                                    .addField(`📦・Quantidade:`, `${quantidade1}`)
                                                                    .addField(`💵・Total:`, `${precoalt}`)
                                                                    .addField(`🎟️・Cupom:`, `${cupomFinish.idcupom ? `${cupomFinish.idcupom}` : 'Nenhum'}`)
                                                                    .addField(`🎉・Desconto:`, `${cupomFinish.idcupom ? `${cupomFinish.desconto + '.00%'}` : '00.00%'}`)
                                                                    .addField(`💵・Preço Atual:`, `${precoalt}`)
                                                                    .addField(`🆔・Id da compra:`, `${data_id}`)
                                                                    .setColor(config.get(`color`))
                                                                    .setImage(' ')
                                                                msg.edit({ embeds: [embedss2], components: [row], content: `<@${interaction.user.id}> `, fetchReply: true })
                                                                dbc.set(`${cupom}.quantidade`, `${qtdalt} `)
                                                                cupom = dbc.get(`${cupom}`);
                                                            }
                                                        }
                                                    })
                                                })

                                            }

                                            if (intera2.customId === 'cancelarboton') {
                                                clearInterval(timer3);
                                                const embedcancelar2 = new Discord.MessageEmbed()
                                                    .setTitle(`${config.get(`title`)}・Compra Cancelada`)
                                                    .setDescription(`❌・Você cancelou a compra, e todos os produtos foram devolvido para o estoque.Você pode voltar a comprar quando quiser!`)
                                                    .setColor(`#f54646`)
                                                    .setImage(' ')
                                                interaction.user.send({ embeds: [embedcancelar2] })
                                                db3.delete(`${data_id} `)
                                                if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                            }

                                            if (intera2.customId === "continuarboton") {
                                                const cupomFinish = cupom
                                                msg.channel.bulkDelete(50);
                                                clearInterval(timer3);
                                                const venda = setTimeout(function () {
                                                    if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                                    db3.delete(`${data_id} `)
                                                }, 1800000)
                                                mercadopago.configurations.setAccessToken(config.get(`access_token`));
                                                var payment_data = {
                                                    transaction_amount: Number(precoalt),
                                                    description: `Pagamento・${interaction.user.username} `,
                                                    payment_method_id: 'pix',
                                                    payer: {
                                                        email: 'alancordeiroyt@gmail.com',
                                                        first_name: 'Alan',
                                                        identification: {
                                                            type: 'CPF',
                                                            number: '082.970.716-69'
                                                        },
                                                        address: {
                                                            zip_code: '39663-000',
                                                            street_name: 'Avenida Saldade',
                                                            street_number: '123',
                                                            neighborhood: 'Bonfim',
                                                            city: 'Minas Gerais',
                                                            federal_unit: 'MG'
                                                        }
                                                    }
                                                };

                                                mercadopago.payment.create(payment_data).then(function (data) {
                                                    db3.set(`${data_id}.status`, `Pendente(2)`)
                                                    const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
                                                    const attachment = new Discord.MessageAttachment(buffer, "payment.png");
                                                    const row = new Discord.MessageActionRow()
                                                        .addComponents(
                                                            new Discord.MessageButton()
                                                                .setCustomId('codigo')
                                                                .setEmoji("💲")
                                                                .setLabel("Copia e Cola")
                                                                .setStyle('PRIMARY'),
                                                        )
                                                        .addComponents(
                                                            new Discord.MessageButton()
                                                                .setCustomId('qrcode')
                                                                .setEmoji("📷")
                                                                .setLabel("QR Code")
                                                                .setStyle('SUCCESS'),
                                                        )
                                                        .addComponents(
                                                            new Discord.MessageButton()
                                                                .setLabel("Pagar pelo Site")
                                                                .setEmoji(`🔗`)
                                                                .setURL(`${data.response.point_of_interaction.transaction_data.ticket_url}`)
                                                                .setStyle('LINK'),
                                                        )
                                                        .addComponents(
                                                            new Discord.MessageButton()
                                                                .setCustomId('cancelarpix')
                                                                .setEmoji("❌")
                                                                .setLabel("Cancelar")
                                                                .setStyle('DANGER'),
                                                        );
                                                    const embed = new Discord.MessageEmbed()
                                                        .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                                        .setDescription(`\`\`\`Pague para receber o produto.\`\`\``)
                                                        .addField(`💎・Produto:`, `${eprod.nome}`)
                                                        .addField(`📦・Quantidade:`, `${quantidade1}`)
                                                        .addField(`💵・Total:`, `${precoalt}`)
                                                        .addField(`🎟️・Cupom:`, `${cupomFinish.idcupom ? `${cupomFinish.idcupom}` : 'Nenhum'}`)
                                                        .addField(`💵・Desconto:`, `${cupomFinish.idcupom ? `${cupomFinish.desconto + '.00%'}` : '00.00%'}`)
                                                        .addField(`💵・Preço Atual: `, `${precoalt}`)
                                                        .addField(`🆔・Id da compra: `, `${data_id}`)
                                                        .setColor(config.get(`color`))
                                                        .setImage(' ')
                                                    msg.channel.send({ embeds: [embed], content: `<@${interaction.user.id}> `, components: [row] }).then(msg => {

                                                        const collector = msg.channel.createMessageComponentCollector();
                                                        const lopp = setInterval(function () {
                                                            const time2 = setTimeout(function () {
                                                                clearInterval(lopp);
                                                            }, 1800000)
                                                            axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                                                                headers: {
                                                                    'Authorization': `Bearer ${config.get(`access_token`)}`
                                                                }
                                                            }).then(async (doc) => {
                                                                if (doc.data.collection.status === "approved") {
                                                                    db3.set(`${data_id}.status`, `Processando`)
                                                                }

                                                                if (`${db3.get(`${data_id}.status`)}` === "Processando") {
                                                                    clearTimeout(time2)
                                                                    clearInterval(lopp);
                                                                    clearInterval(venda);
                                                                    const vendadel = setTimeout(function () {
                                                                        if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                                                    }, 60000)
                                                                    const a = db.get(`${severi}.conta`);
                                                                    const canalif1 = client.channels.cache.get(config.canallogs);
                                                                    db2.add("pedidostotal", 1)
                                                                    db2.add("gastostotal", Number(precoalt))
                                                                    db2.add(`${moment().format('L')}.pedidos`, 1)
                                                                    db2.add(`${moment().format('L')}.recebimentos`, Number(precoalt))
                                                                    db2.add(`${interaction.user.id}.gastosaprovados`, Number(precoalt))
                                                                    db2.add(`${interaction.user.id}.pedidosaprovados`, 1)

                                                                    if (a < quantidade1) {
                                                                        db3.set(`${data_id}.status`, `Reembolsado`)
                                                                        msg.channel.send("<a:emojiload:1079498914534793377>・Pagamento reembolsado")
                                                                        msg.channel.send(`🆔・ID Da compra: ${data_id}`)
                                                                        mercadopago.configure({ access_token: `${config.get(`access_token`)}` });
                                                                        var refund = { payment_id: `${data.body.id}` };
                                                                        mercadopago.refund.create(refund).then(result => {
                                                                            const message2new = new Discord.MessageEmbed()
                                                                                .setTitle(`${config.get(`title`)}・Compra Reembolsada`)
                                                                                .addField(`Comprador:`, `<@${data_id}>`)
                                                                                .addField(`Data da compra:`, `${moment().format('LLLL')}`)
                                                                                .addField(`Nome:`, `${eprod.nome}`)
                                                                                .addField(`Quantidade:`, `${quantidade1}x`)
                                                                                .addField(`Preço:`, `${precoalt}`)
                                                                                .addField(`Id da compra:`, `\`\`\`${data_id}\`\`\``)
                                                                                .setColor(config.get(`color`))
                                                                                .setImage(' ')
                                                                            canalif1.send({ embeds: [message2new] })
                                                                        })
                                                                    } else {
                                                                        const removed = a.splice(0, Number(quantidade1));
                                                                        db.set(`${severi}.conta`, a);
                                                                        const embedentrega = new Discord.MessageEmbed()
                                                                            .setTitle(`${config.get(`title`)}・Seu produto`)
                                                                            .setDescription(`**💎・Produtos:** \n  \`\`\` 1º| ${removed.join("\n")}\`\`\`\n**🆔・Id da Compra:** ${data_id}\n*✅・Obrigado pela confiança em nossa equipe !*\n**💫・Avalie a nossa loja [aqui](https://discord.com/channels/1067440694895054959/1067440695851364416/1080296188340883496)** `)
                                                                            .setColor(config.get(`color`))
                                                                            .setImage(' ')
                                                                        interaction.user.send({ embeds: [embedentrega] })
                                                                        db3.set(`${data_id}.status`, `Concluido`)
                                                                        msg.channel.send("✅・Pagamento aprovado verifique a sua dm!")
                                                                        msg.channel.send(`🆔・ID Da compra: ||${data_id}||`)
                                                                        msg.channel.send("❌・Carrinho fechará em 3 minutos")
                                                                        const membro = interaction.guild.members.cache.get(interaction.user.id)
                                                                        const role = interaction.guild.roles.cache.find(role => role.id === config.get(`role`))
                                                                        membro.roles.add(role)

                                                                        const rowavaliacao = new Discord.MessageActionRow()
                                                                            .addComponents(
                                                                                new Discord.MessageButton()
                                                                                    .setCustomId('1star')
                                                                                    .setEmoji('⭐')
                                                                                    .setLabel('1')
                                                                                    .setStyle('PRIMARY'),
                                                                            )
                                                                            .addComponents(
                                                                                new Discord.MessageButton()
                                                                                    .setCustomId('2star')
                                                                                    .setEmoji('⭐')
                                                                                    .setLabel('2')
                                                                                    .setStyle('PRIMARY'),
                                                                            )
                                                                            .addComponents(
                                                                                new Discord.MessageButton()
                                                                                    .setCustomId('3star')
                                                                                    .setEmoji('⭐')
                                                                                    .setLabel('3')
                                                                                    .setStyle('PRIMARY'),
                                                                            )
                                                                            .addComponents(
                                                                                new Discord.MessageButton()
                                                                                    .setCustomId('4star')
                                                                                    .setEmoji('⭐')
                                                                                    .setLabel('4')
                                                                                    .setStyle('PRIMARY'),
                                                                            )
                                                                            .addComponents(
                                                                                new Discord.MessageButton()
                                                                                    .setCustomId('5star')
                                                                                    .setEmoji('⭐')
                                                                                    .setLabel('5')
                                                                                    .setStyle('PRIMARY'),
                                                                            );

                                                                        let sleep = async (ms) => await new Promise(r => setTimeout(r, ms));
                                                                        let avaliacao = "Nenhuma avaliação enviada..."
                                                                        const embed = await msg.reply({
                                                                            embeds: [new Discord.MessageEmbed()
                                                                                .setTitle(`${config.get(`title`)}・Avaliação`)
                                                                                .setDescription("")
                                                                                .addField(`🛒 Informações:`, `Escolha uma nota essa venda.`)
                                                                                .addField(`⭐ Estrelas:`, `Aguardando...`)
                                                                                .setFooter(`Você tem 30 segundos para avaliar...`)
                                                                                .setColor(config.get(`color`))], components: [rowavaliacao]
                                                                        })
                                                                        timeAvaliacao = setTimeout(() => {
                                                                            const embedaprovadolog = new Discord.MessageEmbed()
                                                                                .setTitle(`${config.get(`title`)}・Compra Aprovada`)
                                                                                .addField(`👤・Comprador:`, `<@${interaction.user.id}>`)
                                                                                .addField(`📅・Data da compra:`, `${moment().format('LLLL')}`)
                                                                                .addField(`💎・Produto:`, `${eprod.nome}`)
                                                                                .addField(`📦・Quantidade:`, `${quantidade1}x`)
                                                                                .addField(`💵・Valor Pago:`, `R$${precoalt}`)
                                                                                .addField(`💫・Avaliação:`, `Nenhuma`)
                                                                                .addField(`🆔・Id da compra:`, `${data_id}`)
                                                                                .setColor(config.get(`color`))
                                                                                .setImage(' ')
                                                                            client.channels.cache.get(config.get(`logs`)).send({ embeds: [embedaprovadolog] })
                                                                            db3.set(`${data_id}.entrid`, `${removed.join(" \n")}`)
                                                                            if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) {
                                                                                c.delete();
                                                                            }
                                                                        }, 30000);
                                                                        const interacaoavaliar = embed.createMessageComponentCollector({ componentType: "BUTTON", });
                                                                        interacaoavaliar.on("collect", async (interaction) => {
                                                                            if (interaction.user.id != interaction.user.id) {
                                                                                return;
                                                                            }

                                                                            if (interaction.isButton()) {
                                                                                var textoest = ""
                                                                                var estrelas = interaction.customId.replace("star", "")

                                                                                for (let i = 0; i != estrelas; i++) {
                                                                                    textoest = `${textoest} ⭐`
                                                                                }

                                                                                interaction.deferUpdate()
                                                                                embed.reply("✅・Obrigado pela avaliação!").then(msg => {
                                                                                    rowavaliacao.components[0].setDisabled(true)
                                                                                    rowavaliacao.components[1].setDisabled(true)
                                                                                    rowavaliacao.components[2].setDisabled(true)
                                                                                    rowavaliacao.components[3].setDisabled(true)
                                                                                    rowavaliacao.components[4].setDisabled(true)

                                                                                    const embednew = new Discord.MessageEmbed()
                                                                                        .setTitle(`${config.get(`title`)}・Avaliação`)
                                                                                        .setDescription("")
                                                                                        .addField(`🛒 Informações:`, `Escolha uma nota essa venda.`)
                                                                                        .addField(`⭐ Estrelas:`, `${textoest} (${estrelas})`)
                                                                                        .setFooter(`Muito pela avaliação, isso ajuda muito a Jett Store ! Volte sempre <3`)
                                                                                        .setColor(config.get(`color`))
                                                                                    embed.edit({ embeds: [embednew], components: [rowavaliacao] })
                                                                                    avaliacao = `${textoest} (${estrelas})`

                                                                                    interaction.channel.send({ embeds: [embed] })
                                                                                    const embedaprovadolog = new Discord.MessageEmbed()
                                                                                        .setTitle(`${config.get(`title`)}・Compra Aprovada`)
                                                                                        .addField(`👤・Comprador:`, `<@${interaction.user.id}>`)
                                                                                        .addField(`📅・Data da compra:`, `${moment().format('LLLL')}`)
                                                                                        .addField(`💎・Produto:`, `${eprod.nome}`)
                                                                                        .addField(`📦・Quantidade:`, `${quantidade1}x`)
                                                                                        .addField(`💵・Valor Pago:`, `R$${precoalt}`)
                                                                                        .addField(`💫・Avaliação:`, `${avaliacao}`)
                                                                                        .addField(`🆔・Id da compra:`, `${data_id}`)
                                                                                        .setColor(config.get(`color`))
                                                                                        .setImage('https://cdn.discordapp.com/attachments/1081018256170696747/1081025864025772102/standard_-_2023-03-02T223026.253.gif')
                                                                                    client.channels.cache.get(config.get(`logs`)).send({ embeds: [embedaprovadolog] })
                                                                                    db3.set(`${data_id}.entrid`, `${removed.join(" \n")}`)
                                                                                    clearInterval(timeAvaliacao)
                                                                                })
                                                                            }
                                                                        })

                                                                        const row = new Discord.MessageActionRow()
                                                                            .addComponents(
                                                                                new Discord.MessageButton()
                                                                                    .setCustomId('reembolso')
                                                                                    .setEmoji('💰')
                                                                                    .setLabel('Reembolsar')
                                                                                    .setStyle('DANGER'),
                                                                            );

                                                                        const canalif = client.channels.cache.get(config.get(`logs_staff`))
                                                                        const message2 = await canalif.send({
                                                                            embeds: [new Discord.MessageEmbed()
                                                                                .setTitle(`${config.get(`title`)}・Compra Aprovada`)
                                                                                .addField(`👤・Comprador:`, `${interaction.user}`)
                                                                                .addField(`📅・Data da compra:`, `${moment().format('LLLL')}`)
                                                                                .addField(`💎・Produto:`, `${eprod.nome}`)
                                                                                .addField(`📦・Quantidade:`, `${quantidade1}x`)
                                                                                .addField(`💵・Preço:`, `${precoalt}`)
                                                                                .addField(`🆔・Id da compra:`, `${data_id}`)
                                                                                .addField(`Produto Entregue: `, `\`\`\`${removed.join(" \n")}\`\`\``)
                                                                                .setColor(config.get(`color`))
                                                                                .setImage('https://cdn.discordapp.com/attachments/1081018256170696747/1081025864025772102/standard_-_2023-03-02T223026.253.gif')], components: [row]
                                                                        })
                                                                        const interação = message2.createMessageComponentCollector()
                                                                        interação.on("collect", async (interaction) => {
                                                                            if (interaction.customId === "reembolso") {
                                                                                const user = interaction.user.id
                                                                                if (interaction.user.id !== `${perms.get(`${user}_id`)}`) return interaction.reply({ content: '❌・Você não está na lista de pessoas!', ephemeral: true })
                                                                                interaction.deferUpdate()
                                                                                mercadopago.configure({ access_token: `${config.get(`access_token`)}` });
                                                                                var refund = { payment_id: `${data.body.id}` };
                                                                                mercadopago.refund.create(refund).then(result => {
                                                                                    db3.set(`${data_id}.status`, `Reembolsado`)
                                                                                    message2.delete()
                                                                                    const message2new = new Discord.MessageEmbed()
                                                                                        .setTitle(`${config.get(`title`)}・Compra Reembolsada`)
                                                                                        .addField(`👤・Comprador:`, `${interaction.user}`)
                                                                                        .addField(`📅・Data da compra:`, `${moment().format('LLLL')}`)
                                                                                        .addField(`💎・Produto:`, `${eprod.nome}`)
                                                                                        .addField(`📦・Quantidade:`, `${quantidade1}x`)
                                                                                        .addField(`💵・Preço:`, `${precoalt}`)
                                                                                        .addField(`🆔・Id da compra:`, `${data_id}`)
                                                                                        .setColor(config.get(`color`))
                                                                                        .setImage(' ')
                                                                                    canalif.send({ embeds: [message2new] })
                                                                                }).catch(function (error) { interaction.followUp({ content: '❌・Houve algum erro durante a transação, tente novamente!', ephemeral: true }) });
                                                                            }
                                                                        })

                                                                        const row2 = new Discord.MessageActionRow()
                                                                            .addComponents(
                                                                                new Discord.MessageButton()
                                                                                    .setCustomId(interaction.customId)
                                                                                    .setLabel('・Comprar')
                                                                                    .setEmoji("🛒")
                                                                                    .setStyle('SUCCESS'),
                                                                            );

                                                                        const embed2 = new Discord.MessageEmbed()
                                                                            .setTitle(`${config.get(`title`)}・Sistema de Vendas`)
                                                                            .setDescription(`
\`\`\`
${db.get(`${interaction.customId}.desc`)}
\`\`\`
**💎・Nome:**  ${db.get(`${interaction.customId}.nome`)} 
**💵・Preço:**  ${db.get(`${interaction.customId}.preco`)} 
**📦・Estoque:**  ${db.get(`${interaction.customId}.conta`).length} `)
                                                                            .setColor(config.get(`color`))
                                                                            .setImage(' ')
                                                                        interaction.message.edit({ embeds: [embed2], components: [row2] })
                                                                    }
                                                                }
                                                            })
                                                        }, 10000)

                                                        collector.on("collect", interaction => {
                                                            if (interaction.customId === 'codigo') {
                                                                row.components[0].setDisabled(true)
                                                                interaction.reply(data.body.point_of_interaction.transaction_data.qr_code)
                                                                const embed = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                                                    .setDescription(`\`\`\`Pague para receber o produto.\`\`\``)
                                                                    .addField(`💎・Produto:`, `${eprod.nome}`)
                                                                    .addField(`📦・Quantidade:`, `${quantidade1}`)
                                                                    .addField(`💵・Total:`, `${precoalt}`)
                                                                    .addField(`🎟️・Cupom:`, `${cupomFinish.idcupom ? `${cupomFinish.idcupom}` : 'Nenhum.'}`)
                                                                    .addField(`🎉・Desconto:`, `${cupomFinish.idcupom ? `${cupomFinish.desconto + '.00%'}` : '00.00%'}`)
                                                                    .addField(`💵・Preço Atual:`, `${precoalt}`)
                                                                    .addField(`🆔・Id da compra:`, `${data_id}`)
                                                                    .setColor(config.get(`color`))
                                                                    .setImage(' ')
                                                                msg.edit({ embeds: [embed], content: `<@${interaction.user.id}>`, components: [row] })
                                                            }

                                                            if (interaction.customId === 'qrcode') {
                                                                row.components[1].setDisabled(true)
                                                                const embed2 = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.get(`title`)}・Sistema de Compras`)
                                                                    .setDescription(`\`\`\`Pague para receber o produto.\`\`\``)
                                                                    .addField(`💎・Produto:`, `${eprod.nome}`)
                                                                    .addField(`📦・Quantidade:`, `${quantidade1}`)
                                                                    .addField(`💵・Total:`, `${precoalt}`)
                                                                    .addField(`🎟️・Cupom:`, `${cupomFinish.idcupom ? `${cupomFinish.idcupom}` : 'Nenhum.'}`)
                                                                    .addField(`🎉・Desconto:`, `${cupomFinish.idcupom ? `${cupomFinish.desconto + '.00%'}` : '00.00%'}`)
                                                                    .addField(`<:1055857354916245735:1073961919439966310>・Preço Atual:`, `${precoalt}`)
                                                                    .addField(`🆔・Id da compra:`, `${data_id}`)
                                                                    .setColor(config.get(`color`))
                                                                    .setImage(' ')
                                                                msg.edit({ embeds: [embed2], content: `<@${interaction.user.id}>`, components: [row] })

                                                                const embed = new Discord.MessageEmbed()
                                                                    .setTitle(`** QR CODE GERADO COM SUCESSO :**`)
                                                                    .setDescription(``)
                                                                    .setImage("attachment://payment.png")
                                                                    .setColor(config.get(`color`))
                                                                interaction.reply({ embeds: [embed], files: [attachment] })
                                                            }

                                                            if (interaction.customId === 'cancelarpix') {
                                                                clearInterval(lopp);
                                                                clearInterval(venda)
                                                                const embedcancelar3 = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.get(`title`)}・Compra Cancelada`)
                                                                    .setDescription(`❌・Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                                                                    .setColor(`#f54646`)
                                                                    .setImage(' ')
                                                                interaction.user.send({ embeds: [embedcancelar3] })
                                                                db3.delete(`${data_id}`)
                                                                if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) {
                                                                    c.delete();
                                                                }
                                                            }
                                                        })
                                                    })
                                                }).catch(function (error) {
                                                    console.log(error)
                                                });
                                            }
                                        })
                                    })
                                }
                            })
                        })
                    }
                })
            })
        }
    }
})

// Responder menção
client.on("messageCreate", message => {

    if (message.author.bot) return;
    if (message.channel.type == '')
        return
    if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
        let embed = new Discord.MessageEmbed()
            .setColor("BLACK")
            .setDescription(`**🤖・Olá <@${message.author.id}>, sou um bot de vendas automáticas e o meu prefixo é \` ${config.get(`prefix`)} \`veja a minha lista de comandos com \`${config.get(`prefix`)}ajuda\`, caso queira um bot igual a este só chamar o** Pxtrem#2193 **na DM**`)
        message.reply({ embeds: [embed] })
    }
});