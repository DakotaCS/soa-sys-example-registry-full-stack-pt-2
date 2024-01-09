const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const cron = require('node-cron');
const cors = require('cors');

const supabaseURL = 'https://vudfoksgebxejqxjgnli.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZGZva3NnZWJ4ZWpxeGpnbmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5MjUxMzEsImV4cCI6MjAxNTUwMTEzMX0.bjRh4E9fsYZTtF5l58PChhYA4IXuZDq8xdB3qeZYlks';

const supabase = createClient(supabaseURL, supabaseKey);

const corsOptions = {
    origin:'*',
    credentials:true,
    optionSuccesStatus:200,
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/test', (req, res) => {
    res.json({ message: 'Test response' });
  });
  

const updateStatusJob = async  () => {
    try {
        const { data: registryServicelist, error} = await supabase
            .from('registry_service_list')
            .select('service_id, endpoint_url');

            if(error){
                throw new Error('Error in fetching from Supabase');
            }

            registryServicelist.forEach(async (entry) => {
                const service_id = entry.service_id;
                const endpointURL = entry.endpoint_url;
                

                try{
                const serviceResponse = await fetch(endpointURL, {
                    method: 'GET',
                });

                if (serviceResponse.ok) {
                    //success
                    console.log(`Service at ${endpointURL} is active`);
                    await supabase  
                        .from('registry_service_list')
                        .eq('endpoint_url', endpointURL);
                } else {
                    //fail
                    console.error(`Error calling service at ${endpointURL}. Status: ${serviceResponse.status} serviceID is ${service_id}`);
                    await supabase
                        .from('registry_service_list')
                        .delete()
                        .eq('endpoint_url', endpointURL);
                }

            } catch (error) {
                console.error(`Error calling service at ${endpointURL}: ${error.message}`);
            }
        });

    } catch (error) {
        console.error('Error:', error.message);
    }

};

updateStatusJob();

cron.schedule('*/1 * * * *', updateStatusJob);

app.post("/api/service-registry", async (req, res) => {
    try {
        const requestData = req.body;

        const { data, error } = await supabase
            .from('registry_service_list')
            .upsert([{ ...requestData}], { onConflict: ['service_id']});

        if (error){
            console.error('Error:', error.message);
            res.status(404).json({ error: 'Service not found'});
        }
        console.log('Logged data:', data);
        res.json({ message: 'Service Registered Successfully'});
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ error: 'Something else went wrong'});
    }
});

app.get("/api/service-registry/service/find-all", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('registry_service_list')
            .select('*');

        if (error) {
            res.status(404).json({ error: 'No Services were not found' });
        } else if (!data) {
            res.status(404).json({ error: 'Services were not found' });
        } else {
            console.log('The following Services were returned', data);
            res.json(data);
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Please check the error log' });
    }
});

app.listen(5000, () => {
    console.log("Server is on port http://localhost:5000")
});
    
