const Discord = require("discord.js")

module.exports = {
    name: "botinfo", // Coloque o nome do comando do arquivo
    aliases: ["infobot"], // Coloque sinônimos aqui

    run: async (client, message, args) => {

        let servidor = client.guilds.cache.size;
        let usuarios = client.users.cache.size;
        let canais = client.channels.cache.size;
        let ping = client.ws.ping;
        let dono_id = "1067430744743477298"; // Seu ID
        let dono = client.users.cache.get(dono_id);
        let prefixo = ".";
        let versao = "1.6";

        let embed = new Discord.MessageEmbed()
            .setColor("#ffffff")
            .setTimestamp(new Date)
            .setDescription(`🚀  | Olá, tudo bem? me chamo, **[${client.user.username}](https://discord.gg/t7HGW5HS4s)**  e fui desenvolvido por Jett Store ( kauxzn ), um sistema avançado.


\ **・🚀 | Desenvolvedores: ** [Pxtrem#2193](https://discord.gg/t7HGW5HS4s)
\ **・🚀 | Linguagem: ** [node.js](https://nodejs.org/en/)
\ **・🚀 | Versão: ** ${versao}

\ **・🏓 | Ping:** ${ping}`);



        message.reply({ embeds: [embed] })



    }
}